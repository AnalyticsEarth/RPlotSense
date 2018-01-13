define( ["qlik", "css!./aeRPlotSense.css"],
	function ( qlik) {
		"use strict";
		return {
			initialProperties: {
				selectionMode : "CONFIRM",
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 2,
						qHeight: 100
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 0,
						max: 1
					},
					measures: {
						uses: "measures",
						min: 1,
						max: 1
					},
					sorting: {
						uses: "sorting"
					},
					appearance: {
						uses: "settings",
						items:{
							imageType:{
								ref: "props.imageDataType",
								label: "Image Data Type",
								type: "string",
								component: "dropdown",
								defaultValue:"image/svg+xml",
								options:[
									{
										value:"image/svg+xml",
										label:"SVG"
									},
									{
										value:"image/png;base64",
										label:"PNG"
									},
									{
										value:"image/jpg;base64",
										label:"JPEG"
									}
								]
							},
							gridCols:{
								ref: "props.gridCols",
								label: "Columns",
								type: "string",
								defaultValue:"1"
							}
						}
					}
				}
			},
			support: {
				snapshot: true,
				export: true,
				exportData: true
			},
			paint: function ($element, layout ) {
				var self = this;
				function getImage(row, imgCol, titleCol){

					//Image
					var imgdata = row[imgCol].qText;
					var image = new Image();
					image.src = 'data:'+layout.props.imageDataType+','+imgdata;



					if(typeof titleCol != "undefined"){
						//Item Wrapper DIV
						var div = document.createElement("div");
						div.className = "rimageframe rimage-flex-row";
						div.style = "width:"+(100/parseInt(layout.props.gridCols))+"%;";
						$element.addClass("rimagetab");

						$element.append(div);

						//Border Wrapper DIV
						var divBorder = document.createElement("div");
						divBorder.className = "selectable rimageborder";
						div.appendChild(divBorder);

						//Title DIV
						var divtitle = document.createElement("div");
						divtitle.innerHTML = row[titleCol].qText;
						divBorder.appendChild(divtitle);
						if(row[titleCol].qState == "S"){
							divtitle.className = "rimagetitle selectedtitle";
						}else{
							divtitle.className = "rimagetitle";
						}

						//Add Selection Data to frame
						divBorder.setAttribute("data-value",row[titleCol].qElemNumber);

						divBorder.appendChild(image);
						image.className = "rimage";

					}else{

						$element.addClass("rimagetabsingle");
						image.className = "rimagesingle";
						$element.append(image);
					}
				}

				$element.empty();

				var imgCol, titleCol;
				if(layout.qHyperCube.qDimensionInfo.length == 0){
					//The Hypercube only contains the measure
					imgCol = 0;
				}else{
					//The Hypercube contains dimensions and measure
					imgCol = 1;
					titleCol = 0;
				}

				layout.qHyperCube.qDataPages[0].qMatrix.forEach(r => {
					//console.log("ROW", r);
					getImage(r, imgCol, titleCol);
				});


				//Enable Selections on Dimension
				if(this.selectionsEnabled && layout.selectionMode !== "NO") {
					$element.find('.rimageborder').on('qv-activate', function() {
						if(this.hasAttribute("data-value")) {
							var value = parseInt(this.getAttribute("data-value"),10), dim = 0;
							if(layout.selectionMode === "CONFIRM") {
								self.selectValues(dim, [value], true);
								$(this).toggleClass("selected");
								$(this).find(".rimagetitle").toggleClass("selectedtitle");
							} else {
								self.backendApi.selectValues(dim, [value], true);
							}
						}
					});
				}

				//needed for export
				return qlik.Promise.resolve();
			}
		};

	} );
