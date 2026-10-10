/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
  collection.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
  collection.deleteRule = "@request.auth.role = 'admin'"

  // remove
  collection.schema.removeField("users_avatar")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "users_role",
    "name": "role",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "admin",
        "candidate"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "id = @request.auth.id"
  collection.viewRule = "id = @request.auth.id"
  collection.updateRule = "id = @request.auth.id"
  collection.deleteRule = "id = @request.auth.id"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "users_avatar",
    "name": "avatar",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/gif",
        "image/webp"
      ],
      "thumbs": null,
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  // remove
  collection.schema.removeField("users_role")

  return dao.saveCollection(collection)
})
