
$(document).ready(() => {
    room_id = $('#thisroomid').html();
    console.log(room_id);

    syncMap = {
        room_ID: room_id
    };

    let syncParams = $.param(syncMap);

	$("#sync").click(() => {
		$.post('/sync', syncParams);
	});
});
