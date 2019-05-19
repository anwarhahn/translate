from bs4 import BeautifulSoup
from bs4.element import Tag
from tornado import web, ioloop
from tornado.escape import to_basestring
from tornado.httpclient import AsyncHTTPClient
from urllib.parse import urlparse


class TranslateHandler(web.RequestHandler):

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

        data = [tag.get_text() for tag in selection]
        self.finish({
            'translation': None,
            'original': data
        })


if __name__ == "__main__":
    application = web.Application([
        (r"/translate$", TranslateHandler),
    ], debug=True, autoreload=True, serve_traceback=True)
    application.listen(9000)
    ioloop.IOLoop.instance().start()
