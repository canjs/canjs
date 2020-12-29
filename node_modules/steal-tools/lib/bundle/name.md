Naming Rules
===

_bundle-folder = "/bundles"_
_[[HASH]] = a unique hash string build from the concatenated bundles string_
_[[COUNTER]] = if the same file exists (in one build), increase the counter_

## without NPM
### main bundle only
| module                                                   | bundled path                                                           | note                   |
|----------------------------------------------------------|------------------------------------------------------------------------|------------------------|
| mymodule                                                 | `/bundles/mymodule.js`                                                 |                        |
| mymodule.js                                              | `/bundles/mymodule.js`                                                 |                        |
| mymodule                                                 | `/bundles/mymodule.js`                                                 |                        |
| deep/folder/structure/with/very/very-very-very-long-name | `/bundles/deep/folder/structure/with/very/very-very-very-long-name.js` | main bundles arent cut |
| index.stache!done-autorender                             | `/bundles/index.js`                                                    |                        |

### with bundles
| module                                                                                                          | bundled path                                        | note                                                                                                                                 |
|-----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
|                                                                                                                 |                                                     |                                                                                                                                      |
| `["main/bar", "bar/foo"]`                                                                                       | `/bundles/bar-foo.js`                               |                                                                                                                                      |
| `["main/my-very-long-name", "bar/eman-gnol-yrev-ym"]`                                                           | `/bundles/my-very-long-nam-[[HASH]].js`             | [[HASH]] = a unique hash string, concat bundle[0] + bundle[1],cut to 25 chars                                                        |
| `["main/my-very-long-name", "bar/eman-gnol-yrev-ym"]`                                                           | `/bundles/my-very-long-nam-[[HASH]]-[[COUNTER]].js` | [[HASH]] = a unique hash string; concat bundle[0] + bundle[1],cut to 25 chars; if the same file exists, put a counter var at the end |
| `["deep/folder/structure/with/very/very-very-very-long-name","deep/space/nine/is/a/great-series/from-the-90s"]` | `/bundles/very-very-very-l-f802f7c2-[[HASH]].js`    | [[HASH]] = a unique hash string; concat bundle[0] + bundle[1],cut to 25 chars                                                        |
| `["main/bar0815.com.js", "bar/foo- bar"]`                                                                       | `/bundles/bar0815-com-foo-bar.js`                   | for bundles, we only return filenames with chars, numbers, `-` and `_`                                                               |                                                             	|


## with NPM
### main bundle only
| module                                       	| bundled path                     	| note 	|
|----------------------------------------------	|----------------------------------	|------	|
| myproject@1.0.0#bar                          	| `/bundles/myproject/bar.js`      	|      	|
| myproject@1.0.0#index.stache!done-autorender 	| `/bundles/myproject/index.js`    	|      	|
| myproject@1.0.0#main!my-plugin               	| `/bundles/myproject/main.js`     	|      	|
| myproject.com@1.0.0#main                     	| `/bundles/myproject.com/main.js` 	|      	|

### with bundles
| module                                                     	| bundled path                      	| note 	|
|------------------------------------------------------------	|-----------------------------------	|------	|
| `["pkg@1.0.0#component/my-component", "pkg@1.0.0#foobar"]` 	| `/bundles/my-component-foobar.js` 	|      	|
| `["pkg@1.0.0#bar.js", "pkg@1.0.0#foo.js"]`                 	| `/bundles/bar-foo.js`             	|      	|
| `["pkg@1.0.0#main", "jquery@1.0.0#lib/index"]`             	| `/bundles/main-index.js`          	|      	|

| prevent file collisions 1.                               	| bundled path                      	| note                         	|
| ----------------------------------------------------------	|-----------------------------------	|------------------------------	|
| `["pkg@1.0.0#foo", "pkg@1.0.0#bar"]`                     	| `/bundles/foo-bar.js`             	|                              	|
| `["pkg@1.0.0#component/foo", "pkg@1.0.0#component/bar"]` 	| `/bundles/foo-bar-[[COUNTER]].js` 	| put a counter var at the end 	|

| prevent file collisions 2.                          	| bundled path                         	| note                         	|
|-----------------------------------------------------	|--------------------------------------	|------------------------------	|
| `["pkg@1.0.0#main", "jquery@1.0.0#lib/index"]`      	| `/bundles/main-index.js`             	|                              	|
| `["otherpkg@1.0.0#main", "moment@1.0.0#lib/index"]` 	| `/bundles/main-index-[[COUNTER]].js` 	| put a counter var at the end 	|
