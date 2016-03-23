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

class RequestByIndexedIdentifierQuery(object):

    def __init__(self, type, val, owner, size=10):
        self.type = type
        self.val = val
        self.owner = owner
        self.size = size

    def query(self):
        field = "index." + self.type + ".exact"
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"term" : {field : self.val}},
                        {"term" : {"admin.owner.exact" : self.owner}}
                    ]
                }
            },
            "size" : self.size,
            "sort" : [{"created_date" : {"order" : "desc"}}]
        }