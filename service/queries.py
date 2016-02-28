class IndexedIdentifierQuery(object):

    def __init__(self, type, val):
        self.type = type
        self.val = val

    def query(self):
        field = "index." + self.type + ".exact"
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"term" : {field : self.val}}
                    ]
                }
            }
        }