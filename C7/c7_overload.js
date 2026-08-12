Java.perform(function () {
    const challenge_07 = Java.use("uk.rossmarks.fridalab.challenge_07");
    challenge_07.setChall07.overload().implementation = function() {
        challenge_07.chall07.value = "frida"
    }

    Java.choose("uk.rossmarks.fridalab.MainActivity", {
        "onMatch": function(instance) {
            instance.chall07("frida")
        }, 
        "onComplete": function() {

        }
    })
});