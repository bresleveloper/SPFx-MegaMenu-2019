# sp-fx-mega-2019

This is a dup for the (365)[https://github.com/bresleveloper/SPFx-Smart_MegaMenu] version, which works great!

For some reason some things causes error like definig variables or promises as `[]`, or having the `SP` var not defined in the Component const.

Also not recognizing the `SP` namespace.

So this one is with some adjustments.

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

or all together

gulp build; gulp bundle --ship; gulp package-solution --ship


## Adaptaion for Node v14.17.0
`gulp build` will result with `ReferenceError: primordials is not defined`

solution is to create file `npm-shrinkwrap.json` at top level and write inside
```{
  "dependencies": {
    "graceful-fs": {
        "version": "4.2.2"
     }
  }
}```
and run `npm i` again, then gulp build will work



