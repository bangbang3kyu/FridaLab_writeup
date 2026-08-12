Java.perform(function() {
    var c5 = Java.use("uk.rossmarks.fridalab.MainActivity");
    c5.chall05.overload("java.lang.String").implementation = function (s) {
        console.log("called with: "+ s);
        return c5.chall05.overload("java.lang.String").call(this, "frida");
    };
});