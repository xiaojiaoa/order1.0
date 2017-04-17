var aaa ={
    name:'aaa',
    showName:function () {
        return this.name;
    }
};

var bbb ={
    name:'bbb',

};

console.log(aaa.showName.call(bbb,[]));
