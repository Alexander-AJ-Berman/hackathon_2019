
$(document).ready(() => {
    room_id = $('#thisroomid').html();
    console.log(room_id);

    syncMap = {
        roomID: room_id
    };

    let syncParams = $.param(syncMap);

	$("#sync").click(() => {
		$.post('/sync', syncParams);
	});
});
