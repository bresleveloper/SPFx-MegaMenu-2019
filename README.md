# sp-fx-mega-2019



## Add Url to Terms

Either add localCustomProperties to term by the name `url` (must lower case) OR change the TermSet to be Navigation type and fill `SimpleLinkUrl`.

DOES NOT WORK WITH FRIENDLY URLS

## Settings List

### Automativally Created

Your MUST

- create a termset
- add the guid to the `TermSetGuid` row @`Value` column

#### other settings

- You may choose between `Simple`, `Blue` or `EndlessExpand` in the `MegaType` (TODO...)
- You may set the `Direction` row to `rtl` or `ltr` values to override the `direction` css value


### commands

`gulp build`
`gulp bundle --ship`
`gulp package-solution --ship`
