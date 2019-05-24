from collections import deque
import json
from urllib.parse import urlparse

import boto3
from bs4 import BeautifulSoup
from bs4.element import Tag
import structlog
from tornado import web, ioloop
from tornado.escape import to_basestring
from tornado.httpclient import AsyncHTTPClient
import tornado.options

logger = structlog.get_logger(__file__)


def get_counts(data):
    counts = {
        'characterCount': None,
        'wordCount': None,
        'lineCount': None,
    }

    if data is None:
        return counts

    counts['characterCount'] = len(data)
    counts['wordCount'] = len(data.split())
    counts['lineCount'] = len(data.splitlines())
    return counts


class PageFetchHandler(web.RequestHandler):

    async def get(self):
        args = self.request.arguments
        url = to_basestring(args.get('url')[0])
        selector = to_basestring(args.get('selector')[0])
        if args is None:
            self.finish(None)
            return

        if not urlparse(url).scheme:
            url = 'http://' + url

        headers = {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5)'
        }
        http_client = AsyncHTTPClient()
        response = await http_client.fetch(url, headers=headers)
        soup = BeautifulSoup(response.body, features="html.parser")
        selection = soup.body
        if selector:
            selection = soup.select(selector)

        if not selection:
            self.finish(None)
            return
        elif isinstance(selection, Tag):
            selection = [selection]

        data = ' '.join([tag.get_text() for tag in selection])
        self.finish({
            'data': data,
            'counts': get_counts(data),
        })


class TranslateHandler(web.RequestHandler):

    @staticmethod
    def get_text_chunk(chunks):
        if not chunks:
            return None

        text_chunk = ''
        size = 0
        chunk_size = len(chunks[0].encode('utf-8')) if chunks else 0
        while chunks and size + chunk_size < 5000:
            text_chunk += chunks.popleft()
            size += chunk_size
            chunk_size = len(chunks[0].encode('utf-8')) if chunks else 0

        return text_chunk

    @staticmethod
    def translate(translate_client, source):
        end = '。'
        chunks = deque([k + end for k in source.split(end)])
        text = ''
        next_chunk = TranslateHandler.get_text_chunk(chunks)
        while next_chunk:
            result = translate_client.translate_text(
                Text=next_chunk,
                SourceLanguageCode="ja",
                TargetLanguageCode="en"
            )
            text += result.get('TranslatedText')
            next_chunk = TranslateHandler.get_text_chunk(chunks)
        return text

    async def post(self):
        data = json.loads(self.request.body)
        source = data['params']['text']
        text = TranslateHandler.translate(self.application.translate, source)

        self.finish({
            'data': text,
            'counts': get_counts(text),
        })


if __name__ == "__main__":
    logger.info("Parsing command line args")
    tornado.options.parse_command_line()

    application = web.Application([
        (r"/page_fetch$", PageFetchHandler),
        (r"/translate$", TranslateHandler),
    ], debug=True)
    logger.info("Creating the translation client")
    application.translate = boto3.client(
        service_name='translate',
        region_name='us-west-2',
        use_ssl=True
    )
    logger.info("Server listening on port 9000")
    application.listen(9000)
    ioloop.IOLoop.instance().start()
