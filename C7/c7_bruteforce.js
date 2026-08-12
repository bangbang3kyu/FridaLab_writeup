Java.perform(function () {
  var ch7 = Java.use("uk.rossmarks.fridalab.challenge_07");

  Java.choose("uk.rossmarks.fridalab.MainActivity", {
    onMatch: function (instance) {
      for (var i = 1000; i <= 9999; i++) {
        var pin = i.toString();
        if (ch7.check07Pin(pin)) {
          console.log("FOUND PIN = " + pin);
          instance.chall07(pin);
          break;
        }
      }
    },
    onComplete: function () {}
  });
});