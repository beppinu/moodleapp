// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.mod_assign')

/**
 * Handler for online text submission plugin.
 *
 * @module mm.addons.mod_assign
 * @ngdoc service
 * @name $mmaModAssignSubmissionOnlinetextHandler
 */
.factory('$mmaModAssignSubmissionOnlinetextHandler', function() {

    var self = {};

    /**
     * Whether or not the rule is enabled for the site.
     *
     * @return {Boolean}
     */
    self.isEnabled = function() {
        return true;
    };

    /**
     * Get the name of the directive to render this plugin.
     *
     * @param  {Object} plugin Plugin to get the directive for.
     * @param  {Boolean} edit  True if editing a submission, false if read only.
     * @return {String} Directive name.
     */
    self.getDirectiveName = function(plugin, edit) {
        return 'mma-mod-assign-submission-onlinetext';
    };

    /**
     * Should prepare and add to pluginData the data to send to server based in the input data.
     *
     * @param  {Object} assign     Assignment.
     * @param  {Object} submission Submission to check data.
     * @param  {Object} plugin     Plugin to get the data for.
     * @param  {Object} inputData  Data entered in the submission form.
     * @param  {Object} pluginData Object where to add the plugin data.
     * @return {Void}
     */
    self.prepareSubmissionData = function(assign, submission, plugin, inputData, pluginData) {
        pluginData.onlinetext_editor = {
            text: inputData.onlinetext_editor_text,
            format: 1,
            itemid: 0 // Can't add new files yet, so we use a fake itemid.
        };
    };

    /**
     * Check if the submission data has changed for this plugin.
     *
     * @param  {Object} assign     Assignment.
     * @param  {Object} submission Submission to check data.
     * @param  {Object} plugin     Plugin.
     * @param  {Object} inputData  Data entered in the submission form.
     * @return {Promise}           Promise resolved with true if data has changed, resolved with false otherwise.
     */
    self.hasDataChanged = function(assign, submission, plugin, inputData) {
        // Check if text has changed.
        var initialText = plugin.editorfields && plugin.editorfields[0] ? plugin.editorfields[0].text : '',
            newText = inputData.onlinetext_editor_text;

        return initialText != newText;
    };

    return self;
})

.run(function($mmAddonManager) {
    // Use addon manager to inject $mmaModAssignSubmissionDelegate. This is to provide an example for remote addons,
    // since they cannot assume that the quiz addon will be packaged in custom apps.
    var $mmaModAssignSubmissionDelegate = $mmAddonManager.get('$mmaModAssignSubmissionDelegate');
    if ($mmaModAssignSubmissionDelegate) {
        $mmaModAssignSubmissionDelegate.registerHandler('mmaModAssignSubmissionOnlinetext', 'onlinetext',
                                '$mmaModAssignSubmissionOnlinetextHandler');
    }
});
