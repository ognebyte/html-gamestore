let catalog = [];

const loadData = async () => {
    const res = await fetch('../data/catalog.json');
    catalog = await res.json();
};

const getCatalog = () => catalog;


export {
    loadData,
    getCatalog
};
