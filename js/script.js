function main(){
	//cuando alguien haga cambios que entren, o no, por teclado, ejecuta ajax
	var exec, count, keywords, limit, loadPoints, windWidth, res;
	//funcion insertar cargador
	checkPointsLoad();
	$(window).on('resize', checkPointsLoad);

	function checkPointsLoad(){
		loadPoints = '<div id="loading" class="loadingNo"><img src="img/loading.gif"/></div>';
		windWidth = $(window).width();
		if(windWidth > 768){
			$('#loaderContainerSmp').html('');
			$('#loaderContainerBig').html(loadPoints);
		}else{
			$('#loaderContainerSmp').html(loadPoints);
			$('#loaderContainerBig').html('');
		}
	}
	//evitamos que el formulario se envie al hacer submit
	$('#notForm').submit(function(){
		return false;
	})
	$('#keywords').on('input', function(){
		if ($('#info').html.length != 0 || $('#noRes').html('') != 0) {
			$('#info').html('');
			$('#noRes').html('');
			$('#resMvl').html('');

		}
		
		if($('#loading').hasClass('loadingSi') == false){
			$('#loading').toggleClass('loadingSi');	
		}
		
		//si count no es igual a undefined, deten contador
		if (count != undefined) {
			clearInterval(exec);
		}
		//contador lo empezamos en 0
		count = 0;
		exec = setInterval(startPreQuery,100);
	});
	$('#limit').change(wikiQuery);
	function startPreQuery(){
		//incrementamos contador hasta que sea igual a 3 centesimas (el usuario habrá dejado de aporrear el teclado)
		++count;
		if(count > 3.5){
			stopPreQuery();
		}
	}

	function stopPreQuery(){
		//detencion del contador y retorno de la función que hace la consulta
		clearInterval(exec);
		return wikiQuery();	
	}

	function wikiQuery(){
		//el concepto a buscar y el numero de acepciones
		keywords = $('#keywords').val();
		limit = Number($('#limit').val());
		if (keywords.replace(/\s/g,'') == "") {
			//si solo hay espacios en el input, no se construye nada.
			$('#loading').removeClass('loadingSi'); 
			return false;
		}else{
		//iniciamos ajax
			$.ajax({
				method:'GET',
				//origin=* autoriza CORS de cara a la api de wikipedia
				url:'https://en.wikipedia.org//w/api.php?action=opensearch&format=json&origin=*&search='+keywords+'&limit='+limit,
				datatype:'json',
				async:'false',
				timeout:4000,
				//si hay exito en la consulta...
				success:function(data){
					if(data[1].length == 0){
						res = '<p>There is no result.</p>';
						//si no hay datos, "no se encontró resultado"
						$('#info').html('');
						$('#loading').removeClass('loadingSi');
						if (windWidth > 768) {
							$('#noRes').html(res);
						}else{
							$('#resMvl').html(res);
						}
						return false;
					}else{
						//de lo contrario, rellenamos la tabla info
						$('#info').html('<tr id="head"><th>id</th><th>Title</th><th>Description</th></tr>');
						$('#loading').removeClass('loadingSi');
					}
					for (var i = 1; i < data.length; i++) {
						
						for(var j = 0; j < data[i].length; j++){
							if (i == 1) {
								//si i = 1 vamos por los titulos (nos interesa construir las filas)
								$('#info').append('<tr id="row-'+[j]+'"></tr>');
								//metemos un id en celda aparte
								$('#row-'+[j]).append('<td id="field-'+[i]+'-'+[j]+'">'+[j+1]+'</td>');
								//introducimos el anchor cuyo href rellenaremos despues (cuando i sea = 3).
								$('#row-'+[j]).append('<td id="field-'+[i]+'-'+[j]+'"><a href = "" class="anchorArt" target = "_blank">'+data[i][j]+'</a></td>');
								
							}else if(i == 3){
								//si i = 3, estamos con los href. Los convertimos en hipervinculos de los anchor de la columna Article (la segunda).
								$('#row-'+[j]+' td:nth-child(2) a').attr('href', data[i][j]);
							}else if (i == 2 && data[i][j] == ""){
								//excepecion de la desc que viene vacia
								$('#row-'+[j]).append('<td id="field-'+[i]+'-'+[j]+'" class="empty">-</td>');
							}else if (i == 2 && (/may refer to:/.test(data[i][j]) == true || /might refer to:/.test(data[i][j]) == true)){
								//excepecion de la desc que tiene may refer to (añadimos un poco más de texto para evitar confusion)
								$('#row-'+[j]).append('<td id="field-'+[i]+'-'+[j]+'" class="">'+data[i][j].replace(":"," many things. Click on the link to select a specific topic.")+'</td>');
							}else{
								//de lo contrario, rellena el registro ya construido
								$('#row-'+[j]).append('<td id="field-'+[i]+'-'+[j]+'">'+data[i][j]+'</td>');
							}
						}	
					}
					if (windWidth < 768){
						res = '<p>Scroll down to see some results</p>';
						$('#resMvl').html(res);
					}	
				},
				error:function(jqXHR, excepcion){
					var msg = '';
					if (jqXHR.status === 0) {
					msg = '<p>Not connect.\n Verify Network.</p>';
					} else if (jqXHR.status == 404) {
					msg = '<p>Requested page not found. [404]</p>';
					} else if (jqXHR.status == 500) {
					msg = '<p>Internal Server Error [500].</p>';
					} else if (excepcion === 'parsererror') {
					    msg = '<p>Requested JSON parse failed.</p>';
					} else if (excepcion === 'timeout') {
					    msg = '<p>Time out error.</p>';
					} else if (excepcion === 'abort') {
					    msg = '<p>Ajax request aborted.</p>';
					} else {
						//este error es un json y ocurrirá cuando las excepciones sean distintas a las anteriores, por lo que hay que parsear
						var respJson = JSON.parse( jqXHR.responseText );
					    msg = '<p>Uncaught Error.\n'+jqXHR.status.title+'</p>';

					}
					if (windWidth < 768){
							$('#resMvl').html(msg);
						}else{
							$('#noRes').html(msg);
					}
					$('#loading').removeClass('loadingSi');
				}
				
			});//fin de ajax
		
		}
	}
}

$(window).on('load',main);
