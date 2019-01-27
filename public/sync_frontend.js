
$(document).ready(() => {
    room_id = 'k';//get roomID from document

    syncMap = {
        roomID: room_id
    };

    let syncParams = $.param(syncMap);

	$("#sync").click(() => {
		$.post('/sync', syncParams);
	});
});
