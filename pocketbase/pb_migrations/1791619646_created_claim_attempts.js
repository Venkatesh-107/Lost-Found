/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "attempts0000001",
    "created": "2026-10-10 08:07:26.236Z",
    "updated": "2026-10-10 08:07:26.236Z",
    "name": "claim_attempts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ca_post_id",
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
        "id": "ca_cand_id",
        "name": "candidate_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "ca_answers",
        "name": "answers",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "ca_passed",
        "name": "passed",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role = 'admin'",
    "viewRule": "@request.auth.role = 'admin'",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("attempts0000001");

  return dao.deleteCollection(collection);
})
