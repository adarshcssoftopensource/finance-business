
module.exports = {
    tapfilateDetect: {
        initialize: function initialize() {
            //   function tap (t, a, p) { t.TapfiliateObject = a; t[a] = t[a] || function () { (t[a].q = t[a].q || []).push(arguments) } }
            (function(t,a,p){t.TapfiliateObject=a;t[a]=t[a]||function(){ (t[a].q=t[a].q||[]).push(arguments)}})(window,'tap');
            tap('create', '49530-805d72', { integration: "javascript" });
            tap('detect');
        }
    },
    tapfilateConversion: {
        initialize: function conversion(email) {
            //   function tap (t, a, p) { t.TapfiliateObject = a; t[a] = t[a] || function () { (t[a].q = t[a].q || []).push(arguments) } };
            (function(t,a,p){t.TapfiliateObject=a;t[a]=t[a]||function(){ (t[a].q=t[a].q||[]).push(arguments)}})(window,'tap');
            tap('create', '49530-805d72', { integration: "javascript" });
            tap('conversion', email);
        }
    }
};