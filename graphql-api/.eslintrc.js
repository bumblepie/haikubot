module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-console": "off",
        "class-methods-use-this": [ 2, {
          "exceptMethods": ["getChannel", "getServer"]
        }]
    }
};
