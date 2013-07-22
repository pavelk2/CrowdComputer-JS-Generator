//GET url pars
console.log("croco4TurkAndCC");

$(document).ready(

    function() {
    // if we are not in Mturk don't to anythin
    if (getURLParameter('hitId') == null) {
        console.log("not in MTURK");
        return;
    } else {
        $("form input[type=submit]").attr("value", "Submit to CC, Turk and Requester");
    }

    //
    // Check if the worker is PREVIEWING the HIT or if they've
    // ACCEPTED the HIT
    //
    if (getURLParameter('assignmentId') == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        // If we're previewing, disable the button and give it a
        // helpful message
        $("form").find(':input').prop("disabled", true);
        var msg = "You must ACCEPT the HIT before you can submit the results."
        $("form input[type=submit]").attr("value", msg);
        $('body').prepend("<h1 style=\"color:red\">" + msg + "</h1>")
    }

    // this should automatically find the form.
    $("form input[type=submit]").click(
        function() {
            sendDataToCC(JSON.stringify(collectFormData($('form'))));
            $("form input[type=submit]").prop("disabled", true);
            $("form input[type=submit]").attr("value", "Sending data, please wait");
            var action = $("form").attr("action");
        // add hitid and assignmentID to form
        // data.
        // hit id is not of mturk class, so it's
        // not stored twice in MTURK results
        var hitId = $('<input/>').attr({
            type: 'hidden',
            id: 'hitId',
            name: 'hitId',
            value: getURLParameter('hitId'),  
            "class": "dev-croco" 
        });
        $("form").append(hitId);
        var workerId = $('<input/>').attr({
            type: 'hidden',
            id: 'workerId',
            name: 'workerId',
            value: getURLParameter('workerId'),
            "class": "dev-croco"
        });
        $("form").append(workerId);
        // assignmetID is of mturk class, so
        // it's store. This is mandatory from
        // MTurk
        var assignmentId = $('<input/>').attr({
            type: 'hidden',
            id: 'assignmentId',
            name: 'assignmentId',
            value: getURLParameter('assignmentId'),
            "class": "croco"
        });
        $("form").append(assignmentId);

        // do an asyn post here with all the
        // form data to the original URL.
        $.ajax({
            type: 'POST',
            url: action,
            data: $("form").serialize(),
            success: function(data) {
                // if the post replies
                // with some data we add
                // them to the form.
                // this is the form that
                // will be sent to MTurk
                // $.each(
                //              $.parseJSON(data), function(
                //              i, el) {
                //                  var input = $('<input/>').attr({
                //                      type: 'hidden',
                //                      id: el.id,
                //                      name: el.id,
                //                      value: el.value,
                //                      "class": "croco"
                //                  });
                //                  $("form").append(
                //                  input);
                //              });   
                },
            async: false
        });
        var csrftoken = "'" + getURLParameter("csrf") + "'";

        // send to croco
        //var fields = $('form input:not(.croco) ');
        //fields.prop("disabled", true);     
        workerId.prop("disabled",false);  
        hitId.prop("disabled",false);  

        var task_instance_uuid = getURLParameter('uuid');
        console.log(task_instance_uuid);
        var url = decode(getURLParameter('ccl')) + '/exe/taskinstance/' + task_instance_uuid + '/finish/';
        console.log(url);
        // cross domain must be async, so
        // everything is in the success
        // function.
        console.log($("form").serialize());
/*
										 * //if using crossdomain and server
										 * headers (does not work) $.ajax({
										 * type: 'POST', url: url, data:
										 * $("form").serialize(), dataType:
										 * 'json', crossDomain: true, success:
										 * function(data){ console.log(data);
										 * $("form").attr("action",decode(gup("turkSubmitTo"))+"/mturk/externalSubmit") ;
										 * $("form").submit(); }, });
*/
        // trick for cross domain.   
        //$("form").attr("action", decode(getURLParameter("turkSubmitTo")) + "/mturk/externalSubmit");
        //$("form").submit();
  
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            //data: $("form").serialize(),
            //data: 'workerId='+getURLParameter('workerId')+'&assignmentId='+getURLParameter('assignmentId'),//+'&hitId='+getURLParameter('hitId'),
            success: function(data) {
                console.log(data);
                // on success sends to
                // turk.   
				workerId.prop("disabled",true);  
				hitId.prop("disabled",true); 
				  
                $("form").attr("action", decode(getURLParameter("turkSubmitTo")) + "/mturk/externalSubmit");
                $("form").submit();
            },
            beforeSend: function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
        });

});
});