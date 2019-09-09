import {
  StacheElement,
  ObservableObject,
  fixture,
  restModel
} from "//unpkg.com/can@6/core.mjs";

// Stores the next entity id to use.
let entityId = 1;

// Returns an array of entities for the given `parentId`.
// Makes sure the `depth` of entities doesn’t exceed 5.
const makeEntities = function(parentId, depth) {
  if (depth > 5) {
    return [];
  }
  // The number of entities to create.
  const entitiesCount = fixture.rand(10);

  // The array of entities we will return.
  const entities = [];

  for (let i = 0; i < entitiesCount; i++) {
    // The id for this entity
    const id = "" + entityId++;

    // If the entity is a folder or file
    const isFolder = Math.random() > 0.3;

    // The children for this folder.
    const children = isFolder ? makeEntities(id, depth + 1) : [];

    const entity = {
      id: id,
      name: (isFolder ? "Folder" : "File") + " " + id,
      parentId: parentId,
      type: isFolder ? "folder" : "file",
      hasChildren: children.length > 0
    };
    entities.push(entity);

    // Add the children of a folder
    [].push.apply(entities, children);
  }
  return entities;
};

// Make the entities for the demo
const entities = makeEntities("0", 0);

// Add them to a client-like DB store
const entitiesStore = fixture.store(entities);

// Trap requests to /api/entities to read items from the entities store.
fixture("/api/entities", entitiesStore);

// Make requests to /api/entities take 1 second
fixture.delay = 1000;

class Entity extends ObservableObject {
  static props = {
    id: { type: String, identity: true },
    name: String,
    parentId: String,
    hasChildren: Boolean,
    type: String
  };
}

Entity.connection = restModel({
  ObjectType: Entity,
  url: "/api/entities"
});

class AFolder extends StacheElement {
  static view = `
    <span on:click="this.toggleOpen()">{{ this.folder.name }}</span>
    {{# if(this.isOpen) }}
      {{# if(this.entitiesPromise.isPending) }}
        <div class="loading">Loading</div>
      {{ else }}
        <ul>
          {{# for(entity of this.entitiesPromise.value) }}
            <li class=" {{entity.type}}
                        {{# if(entity.hasChildren) }}hasChildren{{/ if }}">
              {{# eq(entity.type, 'file') }}
                📝 <span>{{ entity.name }}</span>
              {{ else }}
                📁 <a-folder folder:from="entity" />
              {{/ eq }}
            </li>
          {{/ for }}
        </ul>
      {{/ if }}
    {{/ if }}
  `;

  static props = {
    folder: Entity,
    isOpen: { type: Boolean, default: false },
    get entitiesPromise() {
      if (this.folder) {
        return Entity.getList({ filter: { parentId: this.folder.id } });
      }
    }
  };

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}

customElements.define("a-folder", AFolder);

root.assign({
  isOpen: true,
  folder: new Entity({
    id: "0",
    name: "ROOT/",
    hasChildren: true,
    type: "folder"
  })
});
