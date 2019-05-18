from bs4 import BeautifulSoup
from bs4.element import Tag
import requests
from tornado import web, ioloop


class MainHandler(web.RequestHandler):
    def get(self, url, selector):
        r = requests.get(url)
        soup = BeautifulSoup(r.body)
        selection = soup.select(selector)
        data = [repr(string) for string in selection.stripped_strings].join(' ')    
        self.finish(data)


if __name__ == "__main__":
    application = web.Application([
        (r"/", MainHandler),
    ])
    application.listen(8888)
    ioloop.IOLoop.instance().start()
