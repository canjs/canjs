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
