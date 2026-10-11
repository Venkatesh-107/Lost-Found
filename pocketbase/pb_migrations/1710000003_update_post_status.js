migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("posts")

  const statusField = collection.schema.getFieldByName("status")
  statusField.options.values = ["active", "claimed", "pending"]
  
  dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("posts")

  const statusField = collection.schema.getFieldByName("status")
  statusField.options.values = ["active", "claimed"]
  
  dao.saveCollection(collection)
})
