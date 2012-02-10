function Calendar () {
	var _settings = {
		'width'     : 500,
		'height'    : 500,
		'container' : 'calendar',
		'padding'   : {
			'canvas' : {
				'top'    : 5,
				'left'   : 5,
				'bottom' : 5,
				'right'  : 5
			},
			'gridItem' : {
				'top'    : 5,
				'left'   : 5,
				'bottom' : 5,
				'right'  : 5
			}
		},
		'margin'    : {
			'canvas' : {
				'top'    : 5,
				'left'   : 5,
				'bottom' : 5,
				'right'  : 5
			},
			'gridItem' : 2 
		},
		'color'      : {
			'gridItem' : {
				'stroke' : '#FFCC00',
				'fill'   : '#FFCC00'
			}
		}
	};

	// Reference to the canvas
	var _canvas           = null;
	var _calendarGrid     = null;
	var _calendarHeader   = null;
	var _calendarSelector = null;

	var _monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

	// Date references
	var currentDate  = new Date.today();
	var dateIterator = currentDate.clone();

	// Contains the coordinates of a drawable area
	// relative to the canvas minus offsets
	var _drawArea = {
		'x'      : null,
		'y'      : null,
		'width'  : null,
		'height' : null
	};

	var _drawCalendar = function () {
		if ( _calendarGrid !== null ) {
			_calendarGrid.remove();
		}

		if ( _calendarSelector !== null ) {
			_calendarSelector.remove();
		}

		_drawCalendarSelector();
		_drawCalendarGrid();
	};

	// Draws out the gregorian month selector which should be
	// part of the calendar header
	var _drawCalendarSelector = function () {
		_calendarSelector = _canvas.rect(
			_drawArea.x,
			_drawArea.y,
			_drawArea.width,
			30
		);

		_calendarSelector.attr({
			'fill'   : '#FFFFFF',
			'stroke' : '#FFFFFF'
		});

		_calendarSelector.paper.text(
			_calendarSelector.attr('width') / 2, 
			_calendarSelector.attr('height') / 2, 
			_monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear()
		);

		var nextMonth = _calendarSelector.paper.rect(
			_drawArea.width / 2 + 80,
			_calendarSelector.attr('height') / 2,
			10,
			10
		).attr('fill', '#000000');

		var prevMonth = _calendarSelector.paper.rect(
			_drawArea.width / 2 - 80,
			_calendarSelector.attr('height') / 2,
			10,
			10
		).attr('fill', '#000000');

		nextMonth.click(function () {
			currentDate  = currentDate.addMonths(1);
			dateIterator = currentDate.clone();
			
			_drawCalendar();
		});

		prevMonth.click(function () {
			currentDate  = currentDate.addMonths(-1);
			dateIterator = currentDate.clone();
		
			_drawCalendar();
		});

	};

	// Draws out the calendar headers 
	// including selector and day of week names
	var _drawCalendarHeader = function () {
		_drawCalendarSelector();
	};

	// Draw out the gregorian calendar
	var _drawCalendarGrid = function () {
		_calendarGrid = _canvas.set();
		
		var gridWidth = (_drawArea.width / 7) - _settings.margin.gridItem;

		// Keep track of the original month before rendering so as to
		// not render past the last days of that month
		var month = dateIterator.getMonth();

		var dayCounter = 1;

		var y = _drawArea.y + _settings.margin.gridItem + _calendarSelector.attr('height');
		for (var py = 1; py <= 6; py++) { 
			var x = _drawArea.x + _settings.margin.gridItem; 

			for (var px = 0; px <= 6; px++) {
				dateIterator.setDate(dayCounter);

				// Skip the rendering of this item if is not present in the
				// current month
				if ( px != dateIterator.getDay() 
					|| dayCounter > dateIterator.getDaysInMonth() 
					|| dateIterator.getMonth() > month) 
				{
					x += gridWidth + _settings.margin.gridItem;
					continue;
				}

				var gridItem = _canvas.rect(
					x, 
					y,
					gridWidth - _settings.margin.gridItem, 
					gridWidth - _settings.margin.gridItem
				);
			
				gridItem.attr({
					'fill'   : _settings.color.gridItem.fill,
					'stroke' : _settings.color.gridItem.stroke
				});

				// Keep track of the original coordinates
				// of the grid item whenever it is closed
				gridItem.original = { 
					'x'      : gridItem.attr('x'),
					'y'      : gridItem.attr('y'),
					'width'  : gridItem.attr('width'),
					'height' : gridItem.attr('height')
				};

				var gridItemDate = gridItem.paper.text(
					gridItem.attr('x') + 10,
					gridItem.attr('y') + 10,
					dayCounter
				);
				
				// Use Raphael set to keep a group of the gridItems
				_calendarGrid.push(gridItem);
				_calendarGrid.push(gridItemDate);


				// Use raphael's click bindings to easily handle click
				// events. Upon click animate the grid item to take up
				// most of the viewport
				gridItem.click(function () {
					if ( this.open === true ) {
						this.animate({
							x      : this.original.x,
							y      : this.original.y,
							width  : this.original.width,
							height : this.original.height
						}, 500, '<', this.toBack);

						this.open = false;
					}
					else {
						this.toFront();
						this.animate({
							x      : _drawArea.x,
							y      : _drawArea.y,
							width  : _drawArea.width,
							height : _drawArea.height
						}, 500, '<');

						this.open = true;
					}
				});
				
				dayCounter++;
				x += gridWidth + _settings.margin.gridItem;
			}
	
			y += gridWidth + _settings.margin.gridItem;
		}
	};

	// Getters/Setters
	// ---------------

	// Returns the current date selected in the calendar
	this.getCurrentDate = function () {
		return currentDate;
	};

	this.setCurrentDate = function ( date ) {
		currentDate = date;
	};

	// Priviledged
	this.init = (function ( options ) {
		_canvas = Raphael( 
			document.getElementById( _settings.container ), 
			_settings.width, 
			_settings.height 
		);
		_canvas.rect(0, 0, _settings.width, _settings.height);

		// Determine the coordinates of the drawable area
		_drawArea = { 
			'x'      : _settings.padding.canvas.left,
			'y'      : _settings.padding.canvas.top,
			'width'  : _settings.width - (_settings.padding.canvas.left + _settings.padding.canvas.right),
			'height' : _settings.height - (_settings.padding.canvas.top + _settings.padding.canvas.bottom)
		};

		_drawCalendarHeader();
		_drawCalendar();
	})();
}

$(document).ready(function() {

	var cal = new Calendar();

});
