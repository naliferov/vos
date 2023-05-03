async () => {
    return class DataNode {
        constructor(data) { this.data = data }
        setKey(key) { this.key = key }
        getKey() { return this.key }

        getPath() { return this.path; }
        setPath(path) { this.path = path; }

        getData() { return this.data }
        setData(data) { this.data = data; }

        getDataType() { return typeof this.data }
        get(k) { return this.data[k] }
        set(k, v) { this.data[k] = v }
        del(k) { delete this.data[k] }
        isEmpty() {
            return Object.keys(this.data).length === 0;
        }
    }
}