+function ($) {
    'use strict';

    var LADB_LENGTH_UNIT_INFOS = {
        0: {name: 'pouce', unit: 'in'},
        1: {name: 'pied', unit: 'ft'},
        2: {name: 'millimètre', unit: 'mm'},
        3: {name: 'centimètre', unit: 'cm'},
        4: {name: 'mètre', unit: 'm'}
    };

    // CLASS DEFINITION
    // ======================

    var LadbTabCutlist = function (element, options, toolbox) {
        this.options = options;
        this.$element = $(element);
        this.toolbox = toolbox;

        this.lengthUnitInfos = LADB_LENGTH_UNIT_INFOS[2];

        this.partNumberLetter = this.toolbox.getSettingsValue('partNumberLetter', true);
        this.partNumberSequenceByGroup = this.toolbox.getSettingsValue('partNumberSequenceByGroup', false);

        this.$filename = $('#ladb_filename', this.$element);
        this.$unit = $('#ladb_unit', this.$element);
        this.$btnRefresh = $('#ladb_btn_refresh', this.$element);
        this.$btnPrint = $('#ladb_btn_print', this.$element);
        this.$panelHelp = $('.ladb-panel-help', this.$element);
        this.$alertErrors = $('.ladb-alert-errors', this.$element);
        this.$alertWarnings = $('.ladb-alert-warnings', this.$element);
        this.$inputPartNumberSequenceByGroup = $('#ladb_input_part_number_sequence_by_group', this.$element);
        this.$inputPartNumberLetter = $('#ladb_input_part_number_letter', this.$element);
        this.$list = $('#list', this.$element);
    };

    LadbTabCutlist.DEFAULTS = {};

    LadbTabCutlist.prototype.getLengthUnitInfos = function (lengthUnitIndex) {
        if (lengthUnitIndex < 0 || lengthUnitIndex >= LADB_LENGTH_UNIT_INFOS.length) {
            return null;
        }
        return LADB_LENGTH_UNIT_INFOS[lengthUnitIndex];
    };

    LadbTabCutlist.prototype.onCutlistGenerated = function (data) {
        var that = this;

        var status = data.status;
        var errors = data.errors;
        var warnings = data.warnings;
        var filepath = data.filepath;
        var lengthUnit = data.length_unit;
        var groups = data.groups;

        // Update filename
        this.$filename.empty();
        this.$filename.append(filepath.split('\\').pop().split('/').pop());

        // Update unit and length options
        this.lengthUnitInfos = this.getLengthUnitInfos(lengthUnit);
        this.$unit.empty();
        this.$unit.append(' en ' + this.lengthUnitInfos.name);

        // Errors
        this.$alertErrors.empty();
        if (errors && errors.length > 0) {
            that.$alertErrors.show();
            errors.forEach(function (error) {
                that.$alertErrors.append(error);
            });
        } else {
            that.$alertErrors.hide();
        }

        // Warnings
        this.$alertWarnings.empty();
        if (warnings && warnings.length > 0) {
            that.$alertWarnings.show();
            warnings.forEach(function (warning) {
                that.$alertWarnings.append(warning);
            });
        } else {
            that.$alertWarnings.hide();
        }

        // Hide help panel
        if (groups.length > 0) {
            this.$panelHelp.hide();
        }

        // Update print button state
        this.$btnPrint.prop('disabled', groups.length == 0);

        // Update list
        this.$list.empty();
        this.$list.append(Twig.twig({ ref: "tabs/cutlist/_list.twig" }).render({
            groups: groups
        }));

        // Bind buttons
        $('.ladb-btn-toggle-no-print', this.$list).on('click', function() {
            var $i = $('i', $(this));
            var groupId = $(this).data('group-id');
            var $group = $('#' + groupId);
            $group.toggleClass('no-print');
            if ($group.hasClass('no-print')) {
                $('tbody', $group).hide();
                $i.removeClass('glyphicon-eye-close');
                $i.addClass('glyphicon-eye-open');
            } else {
                $('tbody', $group).show();
                $i.addClass('glyphicon-eye-close');
                $i.removeClass('glyphicon-eye-open');
            }
            $(this).blur();
        });

    };

    LadbTabCutlist.prototype.bind = function () {
        var that = this;

        // Bind buttons
        this.$btnRefresh.on('click', function () {
            rubyCall('ladb_cutlist_generate', {
                piece_number_letter: that.partNumberLetter,
                piece_number_sequence_by_group: that.partNumberSequenceByGroup
            });
            this.blur();
        });
        this.$btnPrint.on('click', function () {
            window.print();
            this.blur();
        });

        // Bind inputs
        this.$inputPartNumberLetter.on('change', function () {
            that.partNumberLetter = that.$inputPartNumberLetter.is(':checked');
            that.toolbox.setSettingsValue('partNumberLetter', that.partNumberLetter);
        });
        this.$inputPartNumberSequenceByGroup.on('change', function () {
            that.partNumberSequenceByGroup = that.$inputPartNumberSequenceByGroup.is(':checked');
            that.toolbox.setSettingsValue('partNumberSequenceByGroup', that.partNumberSequenceByGroup);
        });

    };

    LadbTabCutlist.prototype.init = function () {
        this.bind();

        // Init inputs values
        this.$inputPartNumberLetter.prop('checked', this.partNumberLetter);
        this.$inputPartNumberSequenceByGroup.prop('checked', this.partNumberSequenceByGroup);
    };


    // PLUGIN DEFINITION
    // =======================

    function Plugin(option, params) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ladb.tabCutlist');
            var options = $.extend({}, LadbTabCutlist.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                if (options.toolbox == undefined) {
                    throw 'toolbox option is mandatory.';
                }
                $this.data('ladb.tabCutlist', (data = new LadbTabCutlist(this, options, options.toolbox)));
            }
            if (typeof option == 'string') {
                data[option](params);
            } else {
                data.init();
            }
        })
    }

    var old = $.fn.ladbTabCutlist;

    $.fn.ladbTabCutlist = Plugin;
    $.fn.ladbTabCutlist.Constructor = LadbTabCutlist;


    // NO CONFLICT
    // =================

    $.fn.ladbTabCutlist.noConflict = function () {
        $.fn.ladbTabCutlist = old;
        return this;
    }

}(jQuery);