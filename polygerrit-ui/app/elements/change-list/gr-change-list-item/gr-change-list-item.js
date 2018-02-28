// Copyright (C) 2016 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function() {
  'use strict';

  const CHANGE_SIZE = {
    XS: 10,
    SMALL: 50,
    MEDIUM: 250,
    LARGE: 1000,
  };

  Polymer({
    is: 'gr-change-list-item',

    properties: {
      visibleChangeTableColumns: Array,
      labelNames: {
        type: Array,
      },

      /** @type {?} */
      change: Object,
      changeURL: {
        type: String,
        computed: '_computeChangeURL(change)',
      },
      statuses: {
        type: Array,
        computed: 'changeStatuses(change)',
      },
      showStar: {
        type: Boolean,
        value: false,
      },
      showNumber: Boolean,
    },

    behaviors: [
      Gerrit.BaseUrlBehavior,
      Gerrit.ChangeTableBehavior,
      Gerrit.PathListBehavior,
      Gerrit.RESTClientBehavior,
      Gerrit.URLEncodingBehavior,
    ],

    _computeChangeURL(change) {
      return Gerrit.Nav.getUrlForChange(change);
    },

    _computeLabelTitle(change, labelName) {
      const label = change.labels[labelName];
      if (!label) { return 'Label not applicable'; }
      const significantLabel = label.rejected || label.approved ||
          label.disliked || label.recommended;
      if (significantLabel && significantLabel.name) {
        return labelName + '\nby ' + significantLabel.name;
      }
      return labelName;
    },

    _computeLabelClass(change, labelName) {
      const label = change.labels[labelName];
      // Mimic a Set.
      const classes = {
        cell: true,
        label: true,
      };
      if (label) {
        if (label.approved) {
          classes['u-green'] = true;
        }
        if (label.value == 1) {
          classes['u-monospace'] = true;
          classes['u-green'] = true;
        } else if (label.value == -1) {
          classes['u-monospace'] = true;
          classes['u-red'] = true;
        }
        if (label.rejected) {
          classes['u-red'] = true;
        }
      } else {
        classes['u-gray-background'] = true;
      }
      return Object.keys(classes).sort().join(' ');
    },

    _computeLabelValue(change, labelName) {
      const label = change.labels[labelName];
      if (!label) { return ''; }
      if (label.approved) {
        return '✓';
      }
      if (label.rejected) {
        return '✕';
      }
      if (label.value > 0) {
        return '+' + label.value;
      }
      if (label.value < 0) {
        return label.value;
      }
      return '';
    },

    _computeProjectURL(project) {
      return Gerrit.Nav.getUrlForProjectChanges(project, true);
    },

    _computeProjectBranchURL(change) {
      return Gerrit.Nav.getUrlForBranch(change.branch, change.project);
    },

    _computeTopicURL(change) {
      if (!change.topic) { return ''; }
      return Gerrit.Nav.getUrlForTopic(change.topic);
    },

    _computeTruncatedProject(project) {
      if (!project) { return ''; }
      return this.truncatePath(project, 2);
    },

    _computeAccountStatusString(account) {
      return account && account.status ? `(${account.status})` : '';
    },

    _computeSizeTooltip(change) {
      if (change.insertions + change.deletions === 0 ||
          isNaN(change.insertions + change.deletions)) {
        return 'Size unknown';
      } else {
        return `+${change.insertions}, -${change.deletions}`;
      }
    },

    /**
     * TShirt sizing is based on the following paper:
     * http://dirkriehle.com/wp-content/uploads/2008/09/hicss-42-csdistr-final-web.pdf
     */
    _computeChangeSize(change) {
      const delta = change.insertions + change.deletions;
      if (isNaN(delta) || delta === 0) {
        return '🤷'; // Unknown
      }
      if (delta < CHANGE_SIZE.XS) {
        return 'XS';
      } else if (delta < CHANGE_SIZE.SMALL) {
        return 'S';
      } else if (delta < CHANGE_SIZE.MEDIUM) {
        return 'M';
      } else if (delta < CHANGE_SIZE.LARGE) {
        return 'L';
      } else {
        return 'XL';
      }
    },
  });
})();
