Java.perform(function () {
  Java.choose("uk.rossmarks.fridalab.MainActivity", {
    onMatch: function (instance) {
      console.log("MainActivity found");
      instance.chall02();
    },
    onComplete: function () {
      console.log("search complete");
    }
  });
});