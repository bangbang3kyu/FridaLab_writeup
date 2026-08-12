Java.perform(function () {
  var c6 = Java.use("uk.rossmarks.fridalab.challenge_06");
  var MainActivity = Java.use("uk.rossmarks.fridalab.MainActivity");

  Java.choose("uk.rossmarks.fridalab.MainActivity", {
    onMatch: function (instance) {
      setTimeout(function () {
        instance.chall06(c6.chall06.value);
      }, 10000);
    },
    onComplete: function () {}
  });
});