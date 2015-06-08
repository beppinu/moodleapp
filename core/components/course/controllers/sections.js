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

angular.module('mm.core.course')

/**
 * Sections view controller.
 *
 * @module mm.core.course
 * @ngdoc controller
 * @name mmCourseSectionsCtrl
 */
.controller('mmCourseSectionsCtrl', function($mmCourse, $mmUtil, $scope, $stateParams, $translate, $mmText) {
    var course = $stateParams.course,
        courseid = course.id;

    $scope.courseid = courseid;
    // Format the title in here instead of using mm-format-text to make ionic history get the treated text.
    $mmText.formatText(course.fullname, true).then(function(fullname) {
        $scope.fullname = fullname;
    });

    function loadSections(refresh) {
        return $mmCourse.getSections(courseid, refresh).then(function(sections) {
            $translate('mm.course.showall').then(function(str) {
                // Adding fake first section.
                var result = [{
                    name: str,
                    id: -1
                }].concat(sections);
                $scope.sections = result;
            });
        }, function(error) {
            $mmUtil.showErrorModal('mm.course.couldnotloadsections', true);
        });
    }

    $scope.getState = function(section) {
        return 'site.mm_course-section';
    };

    $scope.doRefresh = function() {
        loadSections(true).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    loadSections().finally(function() {
        $scope.sectionsLoaded = true;
    });
});
