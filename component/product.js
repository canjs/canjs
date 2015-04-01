steal('can/model', function(Model) {
	var setup = can.Map.prototype.setup;

	can.Map.prototype.setup = function() {
		setup.apply(this, arguments);

		var alias, model;
		if((alias = this.constructor.alias) !== undefined) {
			model = this;

			can.batch.start();
			can.each(alias, function(definition, index){
				var hasDefinition = typeof definition !== 'string';
				var shortName = hasDefinition ? definition.name : definition;

				if(hasDefinition) {
					var val = model.attr(shortName);
					model.attr(index, definition.value.call(model, val));
				} else {
					model.attr(index, model.attr(shortName));
				}

				model.removeAttr(shortName);
			});
			can.batch.stop();

		}
	};

	var Product = Model.extend({
		alias: {
			'clubId': 'ci',
			'price': 'dp',
			'clubPrice': 'ip',
			'mapPrice': 'mp',
			'name': 'n',
			'image': 'li',
			'modelNumber': 'mn',
			'longDescription': 'ld',
			'shortDescription': 'sd',
			'variations': {
				name: 'sa',
				value: function (skus) {
					if (!skus) return;
					var product = this;
					var weightedAttributes = [
						'iswti', 'pmxs', 'pmns',
						'suomsin', 'suomplu', 'ulpw'
					];
					return can.map(skus, function (sku) {
						var attrs = {
							product: product,
							itemNumber: sku.attr('in')
						};
						can.each(weightedAttributes, function(val) {
							if (sku.attr(val) == null) {
								attrs[val] = product.attr(val);
							}
						});
						sku.attr(attrs);
						return sku;
					});
				}
			},
			'specifications': 'sp',
			'category': 'pc',
			'freeShipping': 'frs',
			'flowerDeliveryDates': 'fdd',
			'bundleInfo': 'bi',
			'hasSavingsValue': 'evf',
			'savings': 'ev',
			'productRating': 'r',
			'productReviewCount': 'rc',
			'relatedItemsRating': 'pr',
			'relatedItemsReviewCount': 'prc',
			'fulfillmentType': 'ft',
			'mapPriceOption': 'mo',
			'mapOptionApplied': 'moa',
			'selectClubIndicator': 'cs',
			'maximumPackSize': 'pmxs',
			'minimumPackSize': 'pmns',
			'unitOfMeasureInSingular': 'suomsin',
			'unitOfMeasureInPlural': 'suomplu',
			'unitPrice': 'ulpw'
		}
	}, {});

	var product = new Product({
		"pt": "NORMAL ITEM",
		"evf": "0",
		"ev": [],
		"prodrid": "prod15860913",
		"prodid": "prod15860913",
		"id": "prod15860913",
		"n": "Adidas ClimaLite Quarter Zip Pullover (Assorted Colors)",
		"mn": "TM4106S3SAM",
		"sd": "<p>The Adidas ClimaLite Quarter Zip Pullover will have you looking your best when working out or wearing for leisure.<\/p>",
		"ld": "<p>This 100% woven polyester pullover features the iconic Adidas logo. Featuring a quarter length zipper for easy wear, this pullover is guranteed to keep you covered, comfortable and moving. Featuring soft, moisture-wicking ClimaLite fabric, this pullover helps to keep you dry and comfortable throughout wear.<\/p>",
		"se": [],
		"sva": [],
		"frs": 0,
		"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_A",
		"forceLogin": 0,
		"moa": 2,
		"mo": "4",
		"mp": "",
		"dp": "$29.94",
		"ip": "",
		"ulpw": "$0.00",
		"iswti": 0,
		"pmxs": "0",
		"pmns": "0",
		"suomsin": "",
		"suomplu": "",
		"sp": [
			{
				"shd": "Specifications",
				"stxt": "<ul>\n\t<li>Sizes available: M-XXL<\/li>\n\t<li>Available in 4 classic colors<\/li>\n\t<li>Featuring ClimaLite fabric, with wicking capability<\/li>\n\t<li>Fabric content: 100% polyester 215 G/SQM<\/li>\n\t<li>Hydrophillic finish<\/li>\n\t<li>Machine wash cold, do not bleach, tumble dry low, remove promptly after wash<\/li>\n\t<li>Cool iron if needed, do not dry clean, do not use fabric softener<\/li>\n<\/ul>"
			},
			{
				"shd": "Warranty",
				"stxt": "This product is covered by the Sam's Club Member Satisfaction Guarantee."
			},
			{
				"shd": "Assembled Country",
				"stxt": "Vietnam"
			},
			{
				"shd": "Component Country",
				"stxt": "Imported"
			},
			{
				"shd": "Shipping Info",
				"stxt": "<br> Standard - 3 to 8 business days <br> <br> <br>"
			}
		],
		"ElectronicDelivery": "n",
		"ft": [0],
		"ds": 1,
		"cls": 0,
		"isn": 0,
		"tn": "default",
		"sa": [
			{
				"id": "sku16374915",
				"in": 60852,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 1,
				"am": "",
				"ds": 1,
				"cls": 0,
				"cfgd": [
					{"Color": "Black"},
					{"Size": "M"}
				],
				"upc": "88859294505",
				"n": "Adidas Hoodie Black M",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374916",
				"in": 60917,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 3,
				"am": "",
				"ds": 3,
				"cls": 0,
				"cfgd": [
					{"Color": "Black"},
					{"Size": "L"}
				],
				"upc": "",
				"n": "Adidas Hoodie Black L",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374917",
				"in": 60928,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 3,
				"am": "",
				"ds": 3,
				"cls": 0,
				"cfgd": [
					{"Color": "Black"},
					{"Size": "XL"}
				],
				"upc": "",
				"n": "Adidas Hoodie Black XL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374918",
				"in": 60951,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608529_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "Black"},
					{"Size": "XXL"}
				],
				"upc": "",
				"n": "Adidas Hoodie Black XXL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374965",
				"in": 62360,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 1,
				"am": "",
				"ds": 1,
				"cls": 0,
				"cfgd": [
					{"Color": "Navy"},
					{"Size": "M"}
				],
				"upc": "",
				"n": "Adidas Hoodie Navy M",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374919",
				"in": 61255,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 1,
				"am": "",
				"ds": 1,
				"cls": 0,
				"cfgd": [
					{"Color": "Navy"},
					{"Size": "L"}
				],
				"upc": "",
				"n": "Adidas Hoodie Navy L",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16404004",
				"in": 62387,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "Navy"},
					{"Size": "XL"}
				],
				"upc": "",
				"n": "Adidas Hoodie Navy XL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374921",
				"in": 61317,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610623609_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "Navy"},
					{"Size": "XXL"}
				],
				"upc": "",
				"n": "Adidas Hoodie Navy XXL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374937",
				"in": 61748,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 1,
				"am": "",
				"ds": 1,
				"cls": 0,
				"cfgd": [
					{"Color": "White"},
					{"Size": "M"}
				],
				"upc": "",
				"n": "Adidas Hoodie WHTM",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374922",
				"in": 61326,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "White"},
					{"Size": "L"}
				],
				"upc": "",
				"n": "Adidas Hoodie WHTL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374959",
				"in": 62266,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "White"},
					{"Size": "XL"}
				],
				"upc": "",
				"n": "Adidas Hoodie WHTXL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374944",
				"in": 61982,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610617489_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "White"},
					{"Size": "XXL"}
				],
				"upc": "",
				"n": "Adidas Hoodie WHTXXL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374914",
				"in": 60817,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 1,
				"am": "",
				"ds": 1,
				"cls": 0,
				"cfgd": [
					{"Color": "Silver"},
					{"Size": "M"}
				],
				"upc": "",
				"n": "Adidas Hoodie Silver M",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374936",
				"in": 61716,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 3,
				"am": "",
				"ds": 3,
				"cls": 0,
				"cfgd": [
					{"Color": "Silver"},
					{"Size": "L"}
				],
				"upc": "",
				"n": "Adidas Hoodie Silver L",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374920",
				"in": 61296,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [0],
				"ss": 1,
				"am": "",
				"ds": 1,
				"cls": 0,
				"cfgd": [
					{"Color": "Silver"},
					{"Size": "XL"}
				],
				"upc": "",
				"n": "Adidas Hoodie Silver XL",
				"evf": "0",
				"sc": 1,
				"ri": []
			},
			{
				"id": "sku16374943",
				"in": 61969,
				"vi": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_S1",
				"li": "http://scene7.samsclub.com/is/image/samsclub/0040610608179_A",
				"forceLogin": 0,
				"moa": 2,
				"mo": "4",
				"mp": "",
				"dp": "$29.94",
				"ip": "",
				"ulpw": "$0.00",
				"ft": [22],
				"ss": "",
				"am": "",
				"ds": 0,
				"cls": 0,
				"cfgd": [
					{"Color": "Silver"},
					{"Size": "XXL"}
				],
				"upc": "",
				"n": "Adidas Hoodie Silver XXL",
				"evf": "0",
				"sc": 1,
				"ri": []
			}
		],
		"ci": "",
		"f": "",
		"pc": {
			"cid": "12520103",
			"cnm": "Valentine's Day Gifts for Him"
		},
		"r": 0,
		"rc": 0,
		"s": 0,
		"err": "",
		"errCode": "",
		"fss": {
			"fs": "0",
			"fse": "0",
			"fsp": "0"
		},
		"fst": ""
	});

	return product;
});
