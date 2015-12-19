'use strict';

module.exports = function(list, identifier){
    return list.reduce(function(acc, el){
        if(el){
            acc[el[identifier]] = el;
        }
        return acc;
    }, {});
}