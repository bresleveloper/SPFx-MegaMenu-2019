import styles from './AppCustomizer.module.scss';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,PlaceholderContent, PlaceholderName, PlaceholderProvider
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'SpFxMega2019ApplicationCustomizerStrings';

const LOG_SOURCE: string = 'SpFxMega2019ApplicationCustomizer';



import { SPComponentLoader } from '@microsoft/sp-loader';


import {SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
let SP:any;



/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISpFxMega2019ApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SpFxMega2019ApplicationCustomizer
  extends BaseApplicationCustomizer<ISpFxMega2019ApplicationCustomizerProperties> {

    public MegaMenuListData = [];
    public TSguid:string = '';
    public pageDirection:string = '';
    public masterTreesDictionary:{} = {};
    public trees = [];
    public settings:{}={};

  @override
  public onInit(): Promise<void> {
    
    window['MegaMenuInfo']={
      MegaMenuListData:this.MegaMenuListData,
    };
    console.log('SmartMegaMenu onInit 1.0')

    //id="spSiteHeader"
    const head: any = document.getElementsByTagName("head")[0] || document.documentElement;
    let customStyle: HTMLStyleElement = document.createElement("style");
    customStyle.innerHTML = `#spSiteHeader,#spCommandBar{display:none}`
    head.insertAdjacentElement("beforeEnd", customStyle);


    this.getSettings().then(()=>{
      console.log('getSettings resolved');

      this.loadScripts().then(()=>{
        console.log('loadScripts finish (then), SP/window.SP: ', SP, window['SP']);

        this.getTermSetAsTree().then((tree)=>{
          window['tree'] = tree;
          console.log('getTermSetAsTree finish (then)', tree);
          //switch mega-type
          this.buildHtmlBlue(tree);
        });
      })
    }, /*  */ ()=>{
      console.log('getSettings reject');
    })
    return super.onInit();
  }



  public getSettings():Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      let listname:string = 'MegaMenuSettings';
      this.getListItems(listname).then((items)=>{
        this.MegaMenuListData = items
        console.log('this.MegaMenuListData : ',this.MegaMenuListData);

        window['MegaMenuInfo']['mmList'] = this.MegaMenuListData;

        for(let i=0;i<this.MegaMenuListData.length;i++){
          const item = this.MegaMenuListData[i];
          if(i==0){
            this.TSguid = item['Value'];
            this.TSguid = this.TSguid.trim();
            console.log('this.TSguid '+this.TSguid);
          }
          if(i==4 && item['Value']!=null){
            this.pageDirection = item['Value'];
            console.log('this.pageDirection '+this.pageDirection);
          }

        }
        resolve();
      });
      //list not ok
      //reject();
      //console.error("i dont have a guid")
    });
  }

  public buildHtmlBlue(tree:{}){
      //   /*now catch this and insert navigation*/
    let bench = tree["children"];
    window['bench']=bench;
    let inner:any = ``;
    let thLevel:any = ``;
    let currentPageUrl = decodeURI(location.href
                                      .split("?")[0]
                                      .split("#")[0]
                                      .toLowerCase())

    let fLeveltemplate = `<span class="#CLASS# ms-HorizontalNavItem ${styles.topNavSpan}" data-automationid="HorizontalNav-link">
                      <a class="ms-HorizontalNavItem-link is-not-selected ${styles.PermanentA}" href=#HREF# >
                        #NAME#
                      </a>
                    </span>`;
    let sLevelTemplate = `<ul><a class=${styles.sLevelA} href="#HREF#"><li class=${styles.sLevel}>#NAME#</li></a>#MORE#</ul>`;
    let thLevelTemplate = `<a class=${styles.thLevelA} href="#HREF#"><li class=${styles.thLevel}>#NAME#</li></a>`;
    
    
    for(let i=0;i<bench.length;i++){
      //inner+=`<div class=${styles.wrapDiv} onmouseover="this.lastChild.style.visibility='visible';" onmouseleave="this.lastChild.style.visibility='hidden';">`;
      //inner+=`<div class=${styles.wrapDiv} onmouseover="mega_onmouseover(this)" onmouseleave="mega_onmouseleave(this)">`;
      let wrapDivStyle = ' style="'
      let localPorpsKeys = Object.keys(bench[i].localCustomProperties)
      for (let m = 0; m < localPorpsKeys.length; m++) {
        const k = localPorpsKeys[m];
        if (k == "_Sys_Nav_SimpleLinkUrl" || k == "url") {
          continue
        }
        let v = bench[i].localCustomProperties[k]
        wrapDivStyle += `${k}:${v};`
      }
      wrapDivStyle += '" '
      
      inner+=`<div ${wrapDivStyle} class=${styles.wrapDiv}>`;
      
      let outerLink = "#"
      if(bench[i].localCustomProperties["_Sys_Nav_SimpleLinkUrl"]){
          //inner+=fLeveltemplate.replace("#HREF#",bench[i].localCustomProperties["_Sys_Nav_SimpleLinkUrl"]).replace("#NAME#",bench[i].title);
          outerLink = bench[i].localCustomProperties["_Sys_Nav_SimpleLinkUrl"]
      }
      else{
        if(bench[i].url){
          //inner+=fLeveltemplate.replace("#HREF#",bench[i].url).replace("#NAME#",bench[i].title);
          outerLink = bench[i].url
        }
        else{
          //inner+=fLeveltemplate.replace("#NAME#",bench[i].title).replace("#HREF#","#");
        }
      }

      let renderedOuterItem = fLeveltemplate.replace("#NAME#",bench[i].title).replace("#HREF#",outerLink);
      //test if same page
      if (outerLink.toLowerCase() == currentPageUrl) {
        renderedOuterItem = renderedOuterItem.replace("#CLASS#", styles.Active)
      }
      inner += renderedOuterItem
 

      inner+=`<div class ="${styles.openDiv}" class="${String(i)}">`;
      for(let j=0;j<bench[i]['children'].length;j++){
        let subench = bench[i]['children'][j];
        let sHref = subench.localCustomProperties["_Sys_Nav_SimpleLinkUrl"]?subench.localCustomProperties["_Sys_Nav_SimpleLinkUrl"]:subench.url?subench.url:"#";
        if(subench['children']){
          for(let h=0;h<subench['children'].length;h++){
            let subsubench = subench['children'][h];
            let tHref = subsubench.localCustomProperties["_Sys_Nav_SimpleLinkUrl"]?subsubench.localCustomProperties["_Sys_Nav_SimpleLinkUrl"]:subsubench.url?subsubench.url:"#";
            thLevel+=thLevelTemplate.replace("#NAME#",subsubench.title).replace("#HREF#",tHref);
          }
        }

        //inner+=sLevelTemplate.replace("#NAME#",subench.title).replace("#MORE#",thLevel).replace("#HREF#",sHref);
        let renderedInnerItem = sLevelTemplate.replace("#NAME#",subench.title).replace("#MORE#",thLevel).replace("#HREF#",sHref);

        //test if same page
        if (sHref.toLowerCase() == currentPageUrl) {
          renderedInnerItem = renderedInnerItem.replace("#CLASS#", "Active")
        }
        inner += renderedInnerItem

        thLevel=``;
      }
        inner+=`</div>`;
      inner+=`</div>`;
    }


    let topPlaceholder: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    if (topPlaceholder) {
      let siteColUrl= this.context.pageContext.site.absoluteUrl;

      let sideLinksPadding = `padding-left: ${window.innerWidth > 1800 ? "70" : "50"}px; `
      topPlaceholder.domElement.innerHTML = `
        <div class="${styles.app} ${styles.shadow} ">
            <div class= "${styles.header}">
              ${inner}
              <div id="sideMegaLinks" style="align-self: normal;margin-right: auto;${sideLinksPadding}">
                <a href="http://search.maman.iai">
                  <img style="height: 90%;" src="${siteColUrl}/SiteAssets/icon-search.png"/>
                </a>
                <a href="http://phbn01.maman.iai/phbn01/index.html#/search">
                  <img style="height: 90%;" src="${siteColUrl}/SiteAssets/icon-phone.png"/>
                </a>
              </div>
            </div>
          </div>`;

      document.querySelectorAll(`.${styles.wrapDiv}`).forEach(d => {
        let c = d.lastChild as HTMLElement
        if (c.childElementCount > 0) {
          d.addEventListener("mouseover", ()=> c.style.visibility='visible' )
          d.addEventListener("mouseleave", ()=> c.style.visibility='hidden' )
        }
      })

      //toggle shadow
      console.log("xOnLocationChangeFunctions - mega 2019, toggle shadow");

      let region = document.querySelector("[data-is-scrollable]") as HTMLElement
      let app = document.querySelector(`.${styles.app}`) as HTMLElement
      console.log('region, app', region, app);
      
      region.onscroll = ()=> {
        region.scrollTop == 0 ? 
          app.classList.add(styles.shadow) : 
          app.classList.remove(styles.shadow);
      }

      setTimeout(()=>{
        console.log("setTimeout xOnLocationChangeFunctions - mega 2019" );

        window['xOnLocationChangeFunctions'].push(()=>{
          
          console.log("xOnLocationChangeFunctions - mega 2019, set Active");
          //set active
          let x = document.querySelector(`.${styles.Active}`) as HTMLElement
          if (x) {
            x.classList.remove(styles.Active)
          }

          let currentPageUrl = decodeURI(location.href.split("?")[0].toLowerCase())

          document.querySelectorAll(`.${styles.topNavSpan}`).forEach(s =>{
            let u = decodeURI(s.querySelector("a").getAttribute("href")).toLowerCase()
            if (u == currentPageUrl) {
              s.classList.add(styles.Active)
            }
          })
        })
      }, 750)
    }
  }

  public loadScripts():Promise<void>{
    console.log('SmartMegaMenu - loadScripts')
    let siteColUrl= this.context.pageContext.site.absoluteUrl;
    return new Promise<void>((resolve_loadScripts, reject) => {

      SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/init.js', {
          globalExportsName: '$_global_init'
        })
          .then((): Promise<{}> => {
            return SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/MicrosoftAjax.js', {
              globalExportsName: 'Sys'
            });
          })
          .then((): Promise<{}> => {
            return SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.Runtime.js', {
              globalExportsName: 'SP'
            });
          })
          .then((): Promise<{}> => {
            return SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.js', {
              globalExportsName: 'SP'
            });
          })
          .then((): Promise<{}> => {
            return SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.publishing.js', {
              globalExportsName: 'SP'
            });
          })
          .then((): Promise<{}> => {
            return SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.requestexecutor.js', {
              globalExportsName: 'SP'
            });
          })
          .then((): Promise<{}> => {
            return SPComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.taxonomy.js', {
              globalExportsName: 'SP'
            });
          })
          .then(():void => resolve_loadScripts());
    });
  }

  //public getTerms():Promise<SP.Taxonomy.TermCollection>{
  public getTerms():Promise<any>{
    console.log('SmartMegaMenu - getNavigationTerms')
    //let myPromise = new Promise<SP.Taxonomy.TermCollection>((resolve, reject) => {
    let myPromise = new Promise<any>((resolve, reject) => {

      let siteColUrl= this.context.pageContext.site.absoluteUrl;
      //let spContext: SP.ClientContext = new SP.ClientContext(siteColUrl);
      SP = window['SP'];
      console.log('SmartMegaMenu - getTerms: url, SP ', siteColUrl, SP)
      let spContext = new SP.ClientContext(siteColUrl);
      console.log('SmartMegaMenu - getTerms: url, ctx : ', siteColUrl, spContext)

      let taxSession =  SP.Taxonomy.TaxonomySession.getTaxonomySession(spContext);
      let termStore  = taxSession.getDefaultSiteCollectionTermStore();
      //let guid:SP.Guid = new SP.Guid(this.TSguid);
      let guid = new SP.Guid(this.TSguid);
      let termSet = termStore.getTermSet(guid);
      let terms = termSet.getAllTerms();

      console.log('SmartMegaMenu - getTerms b4 load')
      spContext.load(terms);
      console.log('SmartMegaMenu - getTerms b4 executeQueryAsync')
      spContext.executeQueryAsync( ()=> {
        resolve(terms);
      })
    });
    return myPromise;
  }

  public getTermSetAsTree():Promise<{}> {
    return new Promise<{}>((resolve) => {
      this.getTerms().then( (terms) => {
          let termsEnumerator = terms.getEnumerator(),
              tree = {
                  term: terms,
                  children: []
              };
          //ariel
          let termsDict = {}

          // Loop through each term
          while (termsEnumerator.moveNext()) {
              let currentTerm = termsEnumerator.get_current();
              let currentTermPath = currentTerm.get_pathOfTerm().split(';');
              let children = tree.children;

              // Loop through each part of the path
              for (let i = 0; i < currentTermPath.length; i++) {
                  let foundNode = false;

                  let j;
                  for (j = 0; j < children.length; j++) {
                      if (children[j].name === currentTermPath[i]) {
                          foundNode = true;
                          break;
                      }
                  }

                  // Select the node, otherwise create a new one
                  let term = foundNode ? children[j] : { name: currentTermPath[i], children: [] };

                  // If we're a child element, add the term properties
                  if (i === currentTermPath.length - 1) {
                      term.term = currentTerm;
                      term.title = currentTerm.get_name();
                      term.guid = currentTerm.get_id().toString();
                      term.description = currentTerm.get_description();
                      term.customProperties = currentTerm.get_customProperties();
                      term.localCustomProperties = currentTerm.get_localCustomProperties();

                      term.url = '';
                      if (term.localCustomProperties && term.localCustomProperties.url) {
                        term.url = term.localCustomProperties.url;
                      }
                      if (term.localCustomProperties && term.localCustomProperties._Sys_Nav_SimpleLinkUrl) {
                        term.url = term.localCustomProperties._Sys_Nav_SimpleLinkUrl;
                      }

                  }

                  //ariel
                  termsDict[term.guid] = term;
                  this.masterTreesDictionary[term.guid] = term;

                  // If the node did exist, let's look there next iteration
                  if (foundNode) {
                      children = term.children;
                  }
                  // If the segment of path does not exist, create it
                  else {
                      children.push(term);

                      // Reset the children pointer to add there next iteration
                      if (i !== currentTermPath.length - 1) {
                          children = term.children;
                      }
                  }
              }
          }

          tree = this.sortTermsFromTree(tree);
          this.trees.push({tree:tree, dict:termsDict})

          resolve(tree);
      });
  });
}

  public sortTermsFromTree(tree):any {
    // Check to see if the get_customSortOrder function is defined. If the term is actually a term collection,
    // there is nothing to sort.
    if (tree.children.length && tree.term.get_customSortOrder) {
        let sortOrder = null;

        if (tree.term.get_customSortOrder()) {
            sortOrder = tree.term.get_customSortOrder();
        }

        // If not null, the custom sort order is a string of GUIDs, delimited by a :
        if (sortOrder) {
            sortOrder = sortOrder.split(':');

            tree.children.sort(function (a, b) {
                let indexA = sortOrder.indexOf(a.guid);
                let indexB = sortOrder.indexOf(b.guid);

                if (indexA > indexB) {
                    return 1;
                } else if (indexA < indexB) {
                    return -1;
                }

                return 0;
            });
        }
        // If null, terms are just sorted alphabetically
        else {
            tree.children.sort(function (a, b) {
                if (a.title > b.title) {
                    return 1;
                } else if (a.title < b.title) {
                    return -1;
                }

                return 0;
            });
        }
    }

    for (let i = 0; i < tree.children.length; i++) {
        tree.children[i] = this.sortTermsFromTree(tree.children[i]);
    }

    return tree;
  }

  public getListItems(listname:string): Promise<any> {
    let myPromise = new Promise<any>((resolve) => {
    console.log('asking list items for listname: ', listname);

    this.context.spHttpClient.get(
      this.context.pageContext.site.absoluteUrl +
      `/_api/web/lists/GetByTitle('${listname}')/Items`, SPHttpClient.configurations.v1)
      //`/_api/web/lists/GetByTitle('${listname}')/Items`, SPHttpClient.configurations.v1)
          .then((response: SPHttpClientResponse) => {
              response.json().then((data)=> {

                  console.log('list items for listname:', listname, data);
                  resolve(data.value);
              });
          });
    });
    return myPromise;
  }



}
