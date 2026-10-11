migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("posts")

  // Update status field to allow pending
  const statusField = collection.schema.getFieldByName("status")
  statusField.options.values = ["active", "claimed", "pending"]
  
  // Allow any authenticated user to create a post
  collection.createRule = "@request.auth.id != ''"
  
  dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("posts")

  const statusField = collection.schema.getFieldByName("status")
  statusField.options.values = ["active", "claimed"]
  
  collection.createRule = "@request.auth.role = 'admin'"

  dao.saveCollection(collection)
})
