() => {
    const mem = s.process.memoryUsage().heapUsed / 1024 / 1024;
    return `memory ${Math.round(mem * 100) / 100} MB`;
}