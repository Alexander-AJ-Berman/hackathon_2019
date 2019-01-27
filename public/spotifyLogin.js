// for SYNCHRONIZEDAIRPODSPARTY




$(document).ready(() => {
    room_id = get roomID from document

    syncMap = {
        roomID: room_id
    };

    let syncParams = $.param(syncMap);

	$("#sync").click(() => {
		$.post('/sync', syncParams);
	});



	let queryMap =
	{
        client_id: "8fdf389a4342424b8c52c8e8456653ae",
		response_type: "token",
		show_dialog: "true",
    	redirect_uri: "http://localhost:3000/",
        // redirect_uri: "http://6a0909ff.ngrok.io/commonground/loading",
		scope: "playlist-read-collaborative playlist-read-private user-read-recently-played user-top-read user-follow-read user-library-read playlist-modify-private playlist-modify-public "};
	let url = "https://accounts.spotify.com/authorize";

	let queryParams = $.param(queryMap);

	$("#login").click(() => {
		console.log("before api call");
		window.location.href = url + "?" + queryParams;
		console.log("after api call");
	});

});
