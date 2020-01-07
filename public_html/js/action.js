$(document).ready(function() {
	var source = document.getElementById("event-template").innerHTML;
    var eventTemplate = Handlebars.compile(source);

    $.each(events, function(index, event){
    	var eventUI = eventTemplate(event);
    	var date = event['date'];

    	$('#calendar').find('.date-block[data-date="'+date+'"]').find('.events').append(eventUI);
    });

	var panel = {
		el: "#info-panel",
		selectedDateblock: null,
		selectedEvent: null,
		init: function(isNew, e) {
			// clear form data
			panel.clear(e);
			panel.updateDate(e);

			if (isNew) {
			panel.init();
			$(panel.el).addClass("new").removeClass("update");
			panel.selectedDateblock = $(e.currentTarget);
		    }
		   else {
			$(panel.el).addClass("update").removeClass("new");
			panel.selectedDateblock = $("e.cruuentTarget").closest(".date-block");
		    }   
		},

		clear: function(isNew, e) {
			$(panel.el).find("input").val("");
			$(panel.el).find("textarea").val("");
		},
		open: function(isNew, e) {
		  panel.init(isNew, e);
		  panel.hideError();
		  $(panel.el).addClass("open").css({
			top: e.pageY+"px",
			left: e.pageX+"px",
		   }).find(".title [contenteditable]").focus();
	    },
		close: function(e) {
			$(panel.el).removeClass("open");
		},

		updateDate: function(e) {
			// get date from .date-block
			if ($(event.currentTarget).is('.date-block'))
				var date = $(event.currentTarget).data('date');
			else 
				var date = $(event.currentTarget).closest('.date-block').data('date');
			// get year from #calendar
			var year = $("#calendar").data("year");
			// get month from #calendar
			var month = $("#calendar").data("month");

			$(panel.el).find(".month").text(month);
			$(panel.el).find(".date").text(date);
			$(panel.el).find('[name="year"]').val(year);
			$(panel.el).find('[name="month"]').val(month);
			$(panel.el).find('[name="date"]').val(date);
		},
		showError: function(msg) {
			$(panel.el).find(".error-msg").addClass("open")
			  .find(".alert").text(msg);
		},
		hideError: function() {
			$(panel.el).find(".error-msg").removeClass("open");
		},
	};

	$(".date-block")
	  .dblclick(function(e) {
		panel.open(true, e);
	}).on("dblclick", ".event", function(e){
		e.stopPropagation();
		panel.open(false, e);

		panel.selectedEvent = $(e.currentTarget);

		var id = $(this).data("id");
		$.post("event/read.php", { id: id }, function(data, textStatus, xhr){
			$(panel.el).find('[name="id"]').val(data.id);
			$(panel.el).find('[name="title"]').val(data.title);
			$(panel.el).find('[name="start_time"]').val(data.start_time);
			$(panel.el).find('[name="end_time"]').val(data.end_time);
			$(panel.el).find('[name="description"]').val(data.description);
		}).fail(function(xhr){
			panel.showError(xhr.responseText);
		});
	});

	$(panel.el)
	.on("click", ".close", function(e) {
		$("button.cancel").click();
	})
	.on("click", "button", function(e) {
		if ($(this).is(".create") || $(this).is(".update")) {
			if ($(this).is(".create"))
				var action = "event/create.php";
			if ($(this).is(".update"))
				var action = "event/update.php";
			// collect data
			var data = $(panel.el).find("form").serialize();
			// Ajax call API create.php
			$.post(action, data, function(){})
			  .done(function(data, textStatus, xhr) {
			  	if ($(e.currentTarget).is('.update')) 
			  		panel.selectedEvent.remove();
				// insert into Events
                var eventUI = eventTemplate(data);
                // event's order according to start time
                   // each loop check
                   panel.selectedDateblock.find(".event").each(function(index, event) {
                   	var oldEventFromTime = $(event).data('from').split(':');
                   	var newEventFromTime = data.start_time.split(':');

                   	if (oldEventFromTime[0]>newEventFromTime[0] || oldEventFromTime[0]==newEventFromTime[0] && oldEventFromTime[1]>newEventFromTime[1]) {
                   		$(event).before(eventUI);
                   		return false;
                   	}
                   });
                    if (panel.selectedDateblock.find('.event[data-id="'+data.id+'"]').length==0)
                    	panel.selectedDateblock.find('.events').append(eventUI);
                      // if there is no event later than the new event
                         // append the new event in .events
                
                panel.close();
			})
			.fail(function(xhr, textStatus, errorThrown){
				panel.showError(xhr.responseText);
			});		
		}

		if ($(this).is(".cancel")) {
			panel.close();
		}

		if ($(this).is(".delete")) {
			var id = panel.selectedEvent.data("id");
			// Ajax call delete.php with id
			panel.selectedEvent.remove();
			panel.close();
		}
	});
});