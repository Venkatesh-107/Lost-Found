migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("posts")
  
  collection.schema.addField(new SchemaField({
    name: "category",
    type: "text",
    required: false
  }))
  collection.schema.addField(new SchemaField({
    name: "sub_category",
    type: "text",
    required: false
  }))
  
  dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("posts")
  
  collection.schema.removeField("category")
  collection.schema.removeField("sub_category")
  
  dao.saveCollection(collection)
})
