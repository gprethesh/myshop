
class Whereclause {
    constructor(base, bigQ) {
        this.base = base,
            this.bigQ = bigQ
    }

    // defining search method
    search() {
        // checking for search keyword in bigQ if found the do this operation
        const searchword = (this.bigQ.search) ? {
            // if found then use this format {name: {"book1"}}
            name: {
                $regex: this.bigQ.search,
                $options: "i"
            }
        } : {}

        console.log(`searchword`, searchword);
        // then add it to base product.find({name: {"book1"}})
        this.base = this.base.find({ ...searchword })
        return this;
    }

    // defining the pagination with parameter of resultperpage = 5
    pager(resultPerPage) {
        // if currentpage is null set it to 1
        let currentPage = 1
        // if currentpage is not null then set it accordingly to this.bigQ.page = 4
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }

        // define skippage by multiplying resultpage{5} * (currentpage{4}-{1})
        const skipPage = resultPerPage * (currentPage - 1)

        //then add it to base product.find({page: {"1"}})
        this.base = this.base.limit(resultPerPage).skip(skipPage)
        return this;
    }

    // adding $ to gte and lte ($gte || $lte)
    filter() {
        // using spread to make a clone of bigQ and name it copyQ
        let copyOfQ = { ...this.bigQ }

        // deleting the ones which are not being manuplated
        delete copyOfQ["search"];
        delete copyOfQ["page"];
        delete copyOfQ["limit"];

        console.log(`COPYOFQ:`, copyOfQ);
        // converting object jonson to string using Json.stringify
        let copyOfQStringfy = JSON.stringify(copyOfQ)

        // using replace method and adding regex using mapping
        copyOfQStringfy = copyOfQStringfy.replace(/\b(gte|lte)\b/g, (m) => `$${m}`)

        console.log(`COPYOFQSTRINGFY:`, copyOfQStringfy);
        // converting back string to json
        const jsoncopyq = JSON.parse(copyOfQStringfy)

        // then add it to base product.find(bigQ)
        this.base = this.base.find(jsoncopyq)
        return this
    }

    review() {
        // using spread to make a clone of bigQ and name it copyQ
        let copyOFbigQ = { _id: this.bigQ }

        console.log(copyOFbigQ);

        // then add it to base product.find(bigQ)
        this.base = this.base.find(copyOFbigQ)
        return this
    }
}

module.exports = Whereclause

