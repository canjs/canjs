// Stores the next entity id to use.
var entityId = 1;

// Returns an array of entities for the given `parentId`.
// Makes sure the `depth` of entities doesn’t exceed 5.
var makeEntities = function(parentId, depth) {
  if (depth > 5) {
    return [];
  }
  // The number of entities to create.
  var entitiesCount = can.fixture.rand(10);

  // The array of entities we will return.
  var entities = [];

  for (var i = 0; i < entitiesCount; i++) {

    // The id for this entity
    var id = "" + (entityId++);

    // If the entity is a folder or file
    var isFolder = Math.random() > 0.3;

    // The children for this folder.
    var children = isFolder ? makeEntities(id, depth+1) : [];

    var entity = {
      id: id,
      name: (isFolder ? "Folder" : "File") + " " + id,
      parentId: parentId,
      type: (isFolder ? "folder" : "file"),
      hasChildren: children.length > 0
    };
    entities.push(entity);

    // Add the children of a folder
    [].push.apply(entities,  children)

  }
  return entities;
};

// Make the entities for the demo
var entities = makeEntities("0", 0);

// Add them to a client-like DB store
var entitiesStore = can.fixture.store(entities);

// Trap requests to /api/entities to read items from the entities store.
can.fixture("/api/entities", entitiesStore);

// Make requests to /api/entities take 1 second
can.fixture.delay = 1000;

var Entity = can.DefineMap.extend({
  id: "string",
  name: "string",
  parentId: "string",
  hasChildren: "boolean",
  type: "string"
});

Entity.List = can.DefineList.extend({});

can.connect.baseMap({
  Map: Entity,
  url: "/api/entities"
});

var folder = new Entity({
  id: "0",
  name: "ROOT/",
  hasChildren: true,
  type: "folder"
});

var FolderVM = can.DefineMap.extend({
  folder: Entity,
  entitiesPromise: {
    default: function() {
      return Entity.getList({parentId: this.folder.id});
    }
  },
  isOpen: {type: "boolean", default: false},
  toggleOpen: function() {
    this.isOpen = !this.isOpen;
  }
});

// Create an instance of `FolderVM` with the root folder
var rootFolderVM = new FolderVM({
  folder: folder
});

var template = can.stache.from("app-template");
var frag = template(rootFolderVM);

document.body.appendChild( frag );
