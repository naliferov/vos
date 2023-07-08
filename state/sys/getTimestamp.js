() => {
        const dt = new Date;
        let year = dt.getFullYear().toString().padStart(4, '0');
        let day = dt.getDate().toString().padStart(2, '0');
        let month = (dt.getMonth()+1).toString().padStart(2, '0')

        return `${year}-${month}-${day} ${
            dt.getHours().toString().padStart(2, '0')}:${
            dt.getMinutes().toString().padStart(2, '0')}:${
            dt.getSeconds().toString().padStart(2, '0')}`;
    }