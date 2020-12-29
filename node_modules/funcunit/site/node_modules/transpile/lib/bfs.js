// from https://github.com/adlawson/bfs-js/blob/master/bfs.js
module.exports = (function () {

    'use strict';

    function visit(frontier, graph, fn) {
        var level = 0;
        var levels = {};

        while (0 < frontier.length) {
            var next = [];
            for (var i = 0; i < frontier.length; i++) {
                var cur = frontier[i];
                var node = cur.node;
                if(fn(cur) === false){
                  return;	
                }
                levels[node] = level;
                for (var adj in graph[node]) {
                    if (typeof levels[adj] === 'undefined') {
                        next.push({node: adj, path: cur.path.concat(node)});
                    }
                }
            }
            frontier = next;
            level += 1;
        }
    }
    
    function bfs(node, graph, fn) {
        visit([{node: node, path: []}], graph, fn);
    }

    return bfs;

})();