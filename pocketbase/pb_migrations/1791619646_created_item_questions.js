/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "quest1ons000001",
    "created": "2026-10-10 08:07:26.236Z",
    "updated": "2026-10-10 08:07:26.236Z",
    "name": "item_questions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "iq_post_id",
        "name": "post_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "p0sts0000000001",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "iq_question",
        "name": "question",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "iq_answer",
        "name": "answer",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("quest1ons000001");

  return dao.deleteCollection(collection);
})
