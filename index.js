'use strict';

// 此中间件负责生成完全版依赖关系
// 完全版配置表
// module.exports = {
//     combine : {
//         'mo':['mo-core','mo-xpost','mo-dialog' ,'jquery'],
//         'abc':['c','b','c', 'diloag'],
//         'xyz':['dialog-login', 'com:header'],
//         'font':['com:footer','dialog','page:font']

//     },
//     page : {
//         font: ['mo', 'font'],
//         login:['mo', 'abc']
//     }
// }
var nodeUrl = require('url');
var nodePath = require('path');
var nodeFs = require('fs');
var util = require('lang-utils');

module.exports = new astro.Middleware({
    modType: 'merge',
    fileType: ['js']
}, function(asset, next) {
    //2种情况
    //1.存在依赖关系表，并且存在配置项
    var dep = {
        combine : {},
        page : {},
    }
    let depFile = nodePath.join(asset.prjCfg.root, 'config', 'dependon');
    if(nodeFs.existsSync(depFile + '.js')  && require(depFile).combine && require(depFile).combine[asset._name]){
        //依赖关系
        asset.dep = require(depFile);
        next(asset);
        return
    }
    //2.不存在依赖配置，通过jslib和com生成依赖配置表
    //只生成当前请求的依赖配置表，例子
    // module.exports = {
    //     combine : {
    //         'font':['com:footer','dialog','page:font']

    //     },
    //     page : {
    //         font: ['font']
    //     }
    // }
    // 
    var page = new astro.Asset({
        ancestor: asset,
        project: asset.project,
        modType: 'page',
        name: asset._name,
        fileType: 'js'
    });
    page.getContent(function(pageAsset) {
        

        dep.combine[asset._name] = [];
        dep.page[asset._name] = [asset._name];
        //加入jslib组件
        for(let i=0;i<page.jsLibs[1].length;i++){
            dep.combine[asset._name].push(page.jsLibs[1][i]);
        }
        //加入components
        for(let i=0;i<page.components.length;i++){
            dep.combine[asset._name].push('com:'+page.components[i]);
        }
        //加入页面js
        dep.combine[asset._name].push('page:'+asset._name);
        console.log(dep);

        asset.dep = dep;

        next(asset);
    }); 

});
// module.exports = aa;
