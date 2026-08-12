Java.perform(function () {
  Java.choose("uk.rossmarks.fridalab.MainActivity", {
    onMatch: function (instance) {
      var Button = Java.use("android.widget.Button");
      var String = Java.use("java.lang.String");

      var btn = Java.cast(instance.findViewById(2131165231), Button);
      btn.setText(String.$new("Confirm"));
    },
    onComplete: function () {}
  });
});