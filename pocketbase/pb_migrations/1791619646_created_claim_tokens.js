/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "tokens000000001",
    "created": "2026-10-10 08:07:26.236Z",
    "updated": "2026-10-10 08:07:26.236Z",
    "name": "claim_tokens",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ct_post_id",
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
        "id": "ct_cand_id",
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
        "id": "ct_token",
        "name": "token",
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
        "id": "ct_prev_token",
        "name": "prev_token",
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
        "id": "ct_status",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "approved",
            "rejected"
          ]
        }
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
  const collection = dao.findCollectionByNameOrId("tokens000000001");

  return dao.deleteCollection(collection);
})
