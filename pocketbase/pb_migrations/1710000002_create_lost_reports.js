migrate((db) => {
  const collection = new Collection({
    id: "lostreps0000001",
    name: "lost_reports",
    type: "base",
    system: false,
    schema: [
      {
        id: "lr_user_id",
        name: "user_id",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        id: "lr_category",
        name: "category",
        type: "text",
        required: true
      },
      {
        id: "lr_sub_category",
        name: "sub_category",
        type: "text",
        required: true
      },
      {
        id: "lr_description",
        name: "description",
        type: "text",
        required: true
      },
      {
        id: "lr_date_lost",
        name: "date_lost",
        type: "date",
        required: false
      },
      {
        id: "lr_status",
        name: "status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["open", "resolved"]
        }
      }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'"
  });
  
  const dao = new Dao(db);
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("lost_reports");
  if (collection) {
    dao.deleteCollection(collection);
  }
})
