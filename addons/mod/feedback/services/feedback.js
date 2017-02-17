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

angular.module('mm.addons.mod_feedback')

/**
 * Feedback service.
 *
 * @module mm.addons.mod_feedback
 * @ngdoc service
 * @name $mmaModFeedback
 */
.factory('$mmaModFeedback', function($q, $mmSite, $mmSitesManager, $mmFilepool, mmaModFeedbackComponent, $mmUtil) {
    var self = {};

    /**
     * Get cache key for feedback data WS calls.
     *
     * @param {Number} courseId Course ID.
     * @return {String}         Cache key.
     */
    function getFeedbackDataCacheKey(courseId) {
        return 'mmaModFeedback:feedback:' + courseId;
    }

    /**
     * Get cache key for feedback access information data WS calls.
     *
     * @param {Number} feedbackId Feedback ID.
     * @return {String}         Cache key.
     */
    function getFeedbackAccessInformationDataCacheKey(feedbackId) {
        return 'mmaModFeedback:access:' + feedbackId;
    }

    /**
     * Get prefix cache key for feedback analysis data WS calls.
     *
     * @param {Number} feedbackId Feedback ID.
     * @return {String}         Cache key.
     */
    function getAnalysisDataPrefixCacheKey(feedbackId) {
        return 'mmaModFeedback:analysis:' + feedbackId;
    }

    /**
     * Get cache key for feedback analysis data WS calls.
     *
     * @param {Number} feedbackId Feedback ID.
     * @param {Number} [groupId]  Group ID.
     * @return {String}         Cache key.
     */
    function getAnalysisDataCacheKey(feedbackId, groupId) {
        groupId = groupId || 0;
        return getAnalysisDataPrefixCacheKey(feedbackId) + ":" + groupId;
    }


    /**
     * Return whether or not the plugin is enabled in a certain site. Plugin is enabled if the feedback WS are available.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#isPluginEnabled
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}         Promise resolved with true if plugin is enabled, rejected or resolved with false otherwise.
     */
    self.isPluginEnabled = function(siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            return  site.wsAvailable('mod_feedback_get_feedbacks_by_courses') &&
                    site.wsAvailable('mod_feedback_get_access_information');
        });
    };

    /**
     * Get a feedback with key=value. If more than one is found, only the first will be returned.
     *
     * @param  {Number}     courseId        Course ID.
     * @param  {String}     key             Name of the property to check.
     * @param  {Mixed}      value           Value to search.
     * @param  {String}     [siteId]        Site ID. If not defined, current site.
     * @param  {Boolean}    [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return {Promise}                    Promise resolved when the feedback is retrieved.
     */
    function getFeedback(courseId, key, value, siteId, forceCache) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            var params = {
                    courseids: [courseId]
                },
                preSets = {
                    cacheKey: getFeedbackDataCacheKey(courseId)
                };

            if (forceCache) {
                preSets.omitExpires = true;
            }

            return site.read('mod_feedback_get_feedbacks_by_courses', params, preSets).then(function(response) {
                if (response && response.feedbacks) {
                    var current;
                    angular.forEach(response.feedbacks, function(feedback) {
                        if (!current && feedback[key] == value) {
                            current = feedback;
                        }
                    });
                    if (current) {
                        return current;
                    }
                }
                return $q.reject();
            });
        });
    }

    /**
     * Get a feedback by course module ID.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#getFeedback
     * @param   {Number}    courseId        Course ID.
     * @param   {Number}    cmId            Course module ID.
     * @param   {String}    [siteId]        Site ID. If not defined, current site.
     * @param   {Boolean}   [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return  {Promise}                   Promise resolved when the feedback is retrieved.
     */
    self.getFeedback = function(courseId, cmId, siteId, forceCache) {
        return getFeedback(courseId, 'coursemodule', cmId, siteId, forceCache);
    };

    /**
     * Get a feedback by ID.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#getFeedbackById
     * @param   {Number}    courseId        Course ID.
     * @param   {Number}    id              Feedback ID.
     * @param   {String}    [siteId]        Site ID. If not defined, current site.
     * @param   {Boolean}   [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return  {Promise}                   Promise resolved when the feedback is retrieved.
     */
    self.getFeedbackById = function(courseId, id, siteId, forceCache) {
        return getFeedback(courseId, 'id', id, siteId, forceCache);
    };

    /**
     * Invalidates feedback data.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#invalidateFeedbackData
     * @param {Number} courseId Course ID.
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}        Promise resolved when the data is invalidated.
     */
    self.invalidateFeedbackData = function(courseId, siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.invalidateWsCacheForKey(getFeedbackDataCacheKey(courseId));
        });
    };

    /**
     * Get  access information for a given feedback.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#getFeedbackAccessInformation
     * @param   {Number}    feedbackId      Feedback ID.
     * @param   {String}    [siteId]        Site ID. If not defined, current site.
     * @return  {Promise}                   Promise resolved when the feedback is retrieved.
     */
    self.getFeedbackAccessInformation = function(feedbackId, siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            var params = {
                    feedbackid: feedbackId
                },
                preSets = {
                    cacheKey: getFeedbackAccessInformationDataCacheKey(feedbackId)
                };

            return site.read('mod_feedback_get_access_information', params, preSets).then(function(accessData) {
                accessData.capabilities = $mmUtil.objectToKeyValueMap(accessData.capabilities, 'name', 'enabled', 'mod/feedback:');
                return accessData;
            });
        });
    };

    /**
     * Invalidates feedback access information data.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#invalidateFeedbackAccessInformationData
     * @param {Number} feedbackId   Feedback ID.
     * @param  {String} [siteId]    Site ID. If not defined, current site.
     * @return {Promise}        Promise resolved when the data is invalidated.
     */
    self.invalidateFeedbackAccessInformationData = function(feedbackId, siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.invalidateWsCacheForKey(getFeedbackAccessInformationDataCacheKey(feedbackId));
        });
    };

    /**
     * Get analysis information for a given feedback.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#getAnalysis
     * @param   {Number}    feedbackId      Feedback ID.
     * @param   {Number}    [groupId]       Group ID.
     * @param   {String}    [siteId]        Site ID. If not defined, current site.
     * @return  {Promise}                   Promise resolved when the feedback is retrieved.
     */
    self.getAnalysis = function(feedbackId, groupId, siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            var params = {
                    feedbackid: feedbackId
                },
                preSets = {
                    cacheKey: getAnalysisDataCacheKey(feedbackId, groupId)
                };

            if (groupId) {
                params.groupid = groupId;
            }

            return site.read('mod_feedback_get_analysis', params, preSets);
        });
    };

    /**
     * Invalidates feedback analysis data.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#invalidateAnalysisData
     * @param {Number} feedbackId   Feedback ID.
     * @param  {String} [siteId]    Site ID. If not defined, current site.
     * @return {Promise}        Promise resolved when the data is invalidated.
     */
    self.invalidateAnalysisData = function(feedbackId, siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.invalidateWsCacheForKeyStartingWith(getAnalysisDataPrefixCacheKey(feedbackId));
        });
    };

    /**
     * Invalidate the prefetched content except files.
     * To invalidate files, use $mmaModFeedback#invalidateFiles.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#invalidateContent
     * @param {Number} moduleId The module ID.
     * @param {Number} courseId Course ID.
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}
     */
    self.invalidateContent = function(moduleId, courseId, siteId) {
        siteId = siteId || $mmSite.getId();
        return self.getFeedback(courseId, moduleId, siteId, true).then(function(feedback) {
            var ps = [];
            // Do not invalidate feedback data before getting feedback info, we need it!
            ps.push(self.invalidateFeedbackData(courseId, siteId));
            ps.push(self.invalidateFeedbackAccessInformationData(feedback.id, siteId));
            ps.push(self.invalidateAnalysisData(feedback.id, siteId));

            return $q.all(ps);
        });
    };

    /**
     * Invalidate the prefetched files.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#invalidateFiles
     * @param {Number} moduleId  The module ID.
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}         Promise resolved when the files are invalidated.
     */
    self.invalidateFiles = function(moduleId, siteId) {
        return $mmFilepool.invalidateFilesByComponent(siteId, mmaModFeedbackComponent, moduleId);
    };

    /**
     * Report the feedback as being viewed.
     *
     * @module mm.addons.mod_feedback
     * @ngdoc method
     * @name $mmaModFeedback#logView
     * @param {String}  id       Feedback ID.
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}  Promise resolved when the WS call is successful.
     */
    self.logView = function(id, siteId) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            var params = {
                feedbackid: id
            };
            return site.write('mod_feedback_view_feedback', params);
        });
    };

    return self;
});
