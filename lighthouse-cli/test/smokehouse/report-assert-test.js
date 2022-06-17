/**
 * @license Copyright 2022 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable no-control-regex */

import {getAssertionReport} from './report-assert.js';

// Copy/pasted (and reduced) from sample_v2.json so that updates to that LHR
// won't break these tests.
/* eslint-disable max-len */
// @ts-expect-error
const lhr = /** @type {LH.Result} */({
  'lighthouseVersion': '9.5.0',
  'requestedUrl': 'http://localhost:10200/dobetterweb/dbw_tester.html',
  'finalUrl': 'http://localhost:10200/dobetterweb/dbw_tester.html',
  'fetchTime': '2021-09-07T20:11:11.853Z',
  'gatherMode': 'navigation',
  'runWarnings': [],
  'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4635.0 Safari/537.36',
  'environment': {
    'networkUserAgent': 'Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Mobile Safari/537.36 Chrome-Lighthouse',
    'hostUserAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4635.0 Safari/537.36',
    'benchmarkIndex': 1549,
    'credits': {
      'axe-core': '4.2.3',
    },
  },
  'audits': {
    'is-on-https': {
      'id': 'is-on-https',
      'title': 'Does not use HTTPS',
      'description': 'All sites should be protected with HTTPS, even ones that don\'t handle sensitive data. This includes avoiding [mixed content](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/what-is-mixed-content), where some resources are loaded over HTTP despite the initial request being served over HTTPS. HTTPS prevents intruders from tampering with or passively listening in on the communications between your app and your users, and is a prerequisite for HTTP/2 and many new web platform APIs. [Learn more](https://web.dev/is-on-https/).',
      'score': 0,
      'scoreDisplayMode': 'binary',
      'displayValue': '1 insecure request found',
      'details': {
        'type': 'table',
        'headings': [
          {
            'key': 'url',
            'itemType': 'url',
            'text': 'Insecure URL',
          },
          {
            'key': 'resolution',
            'itemType': 'text',
            'text': 'Request Resolution',
          },
        ],
        'items': [
          {
            'url': 'http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',
            'resolution': 'Allowed',
          },
        ],
      },
    },
    'screenshot-thumbnails': {
      'id': 'screenshot-thumbnails',
      'title': 'Screenshot Thumbnails',
      'description': 'This is what the load of your site looked like.',
      'score': null,
      'scoreDisplayMode': 'informative',
      'details': {
        'type': 'filmstrip',
        'scale': 8893,
        'items': [
          {
            'timing': 889,
            'timestamp': 8697590122.000002,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 1779,
            'timestamp': 8698479422,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 2668,
            'timestamp': 8699368722.000002,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 3557,
            'timestamp': 8700258022,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 4447,
            'timestamp': 8701147322,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 5336,
            'timestamp': 8702036622.000002,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 6225,
            'timestamp': 8702925922,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 7114,
            'timestamp': 8703815222.000002,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 8004,
            'timestamp': 8704704522,
            'data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIANUAeAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1ToAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//Z',
          },
          {
            'timing': 8893,
            'timestamp': 8705593822,
            'data': 'data:image/jpeg;base64,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',
          },
        ],
      },
    },
    'cumulative-layout-shift': {
      'id': 'cumulative-layout-shift',
      'title': 'Cumulative Layout Shift',
      'description': 'Cumulative Layout Shift measures the movement of visible elements within the viewport. [Learn more](https://web.dev/cls/).',
      'score': 0.8,
      'scoreDisplayMode': 'numeric',
      'numericValue': 0.13570762803819444,
      'numericUnit': 'unitless',
      'displayValue': '0.136',
      'details': {
        'type': 'debugdata',
        'items': [
          {
            'cumulativeLayoutShiftMainFrame': 0.13570762803819444,
            'totalCumulativeLayoutShift': 0.13570762803819444,
          },
        ],
      },
    },
    'errors-in-console': {
      'id': 'errors-in-console',
      'title': 'Browser errors were logged to the console',
      'description': 'Errors logged to the console indicate unresolved problems. They can come from network request failures and other browser concerns. [Learn more](https://web.dev/errors-in-console/)',
      'score': 0,
      'scoreDisplayMode': 'binary',
      'details': {
        'type': 'table',
        'headings': [
          {
            'key': 'sourceLocation',
            'itemType': 'source-location',
            'text': 'Source',
          },
          {
            'key': 'description',
            'itemType': 'code',
            'text': 'Description',
          },
        ],
        'items': [
          {
            'source': 'exception',
            'description': 'Error: A distinctive error\n    at http://localhost:10200/dobetterweb/dbw_tester.html:56:54',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/dobetterweb/dbw_tester.html',
              'urlProvider': 'network',
              'line': 55,
              'column': 53,
            },
          },
          {
            'source': 'exception',
            'description': 'Error: An ignored error\n    at http://localhost:10200/dobetterweb/dbw_tester.html:59:38',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/dobetterweb/dbw_tester.html',
              'urlProvider': 'network',
              'line': 58,
              'column': 37,
            },
          },
          {
            'source': 'console.error',
            'description': 'Error! Error!',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/dobetterweb/dbw_tester.html',
              'urlProvider': 'network',
              'line': 483,
              'column': 10,
            },
          },
          {
            'source': 'network',
            'description': 'Failed to load resource: the server responded with a status of 404 (Not Found)',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/dobetterweb/unknown404.css?delay=200',
              'urlProvider': 'network',
              'line': 0,
              'column': 0,
            },
          },
          {
            'source': 'network',
            'description': 'Failed to load resource: the server responded with a status of 404 (Not Found)',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/dobetterweb/fcp-delayer.js?delay=5000',
              'urlProvider': 'network',
              'line': 0,
              'column': 0,
            },
          },
          {
            'source': 'network',
            'description': 'Failed to load resource: the server responded with a status of 404 (Not Found)',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/favicon.ico',
              'urlProvider': 'network',
              'line': 0,
              'column': 0,
            },
          },
          {
            'source': 'network',
            'description': 'Failed to load resource: the server responded with a status of 404 (Not Found)',
            'sourceLocation': {
              'type': 'source-location',
              'url': 'http://localhost:10200/dobetterweb/unknown404.css?delay=200',
              'urlProvider': 'network',
              'line': 0,
              'column': 0,
            },
          },
        ],
      },
    },
  },
  'timing': {
    'entries': [
      {
        'startTime': 0,
        'name': 'lh:config',
        'duration': 100,
        'entryType': 'measure',
      },
      {
        'startTime': 0,
        'name': 'lh:config:resolveArtifactsToDefns',
        'duration': 100,
        'entryType': 'measure',
      },
    ],
    'total': 12345.6789,
  },
});
/* eslint-enable max-len */

const artifacts = /** @type {LH.Artifacts} */ ({});

/**
 * Removes ANSI codes.
 * TODO: should make it so logger can disable these.
 * @param {string} text
 */
function clean(text) {
  return text
    .replace(/\x1B.*?m/g, '')
    .replace(/\x1b.*?m/g, '')
    .trim();
}

/**
 * @param {Smokehouse.ExpectedRunnerResult} expected
 */
function getReport(expected) {
  const report = getAssertionReport({lhr, artifacts}, expected);
  return report;
}

describe('report assert', () => {
  it('works (trivial passing)', () => {
    const report = getAssertionReport({lhr, artifacts}, {
      lhr: {
        audits: {},
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    });
    expect(report).toMatchObject({passed: 3, failed: 0, log: ''});
  });

  /** @type {Record<string, Smokehouse.ExpectedRunnerResult>} */
  const testCases = {
    'FAIL missing audit': {
      lhr: {
        audits: {
          'not-an-audit': 0,
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL different number': {
      lhr: {
        audits: {
          'is-on-https': {score: 1234},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL range (1)': {
      lhr: {
        audits: {},
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        timing: [{duration: 100}],
      },
    },
    'FAIL range (2)': {
      lhr: {
        audits: {},
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        timing: [{duration: '>100'}],
      },
    },
    'FAIL range (3)': {
      lhr: {
        audits: {},
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        timing: [{duration: '<100'}],
      },
    },
    'OK array (1)': {
      lhr: {
        audits: {
          'screenshot-thumbnails': {details: {items: {length: '>1'}}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL array (2)': {
      lhr: {
        audits: {
          'screenshot-thumbnails': {details: {items: []}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'OK array (3)': {
      lhr: {
        audits: {
          'cumulative-layout-shift': {details: {items: [
            {
              cumulativeLayoutShiftMainFrame: '>0',
              totalCumulativeLayoutShift: '>0',
            },
          ]}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL array (4)': {
      lhr: {
        audits: {
          'cumulative-layout-shift': {details: {items: [
            {
              cumulativeLayoutShiftMainFrame: '>0',
              totalCumulativeLayoutShift: '>0',
            },
            // Fails because there is only one item in the actual array.
            {},
          ]}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'OK _includes (1)': {
      lhr: {
        audits: {
          'errors-in-console': {details: {items: {_includes: [
            {description: /An ignored error/},
            {description: /A distinctive error/},
          ]}}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL _includes (1)': {
      lhr: {
        audits: {
          'errors-in-console': {details: {items: {_includes: [
            {description: /A distinctive error/},
            // Fails because can't double-count same item, and there is only one item
            // that matches this value.
            {description: /A distinctive error/},
          ]}}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL _includes (3)': {
      lhr: {
        audits: {
          'errors-in-console': {details: {items: {_includes: [
            {description: /I don't exist/},
          ]}}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'OK _excludes (1)': {
      lhr: {
        audits: {
          'errors-in-console': {details: {items: {_excludes: [
            {description: /I don't exist/},
            {descriptionLOL: /I really don't exist/},
          ]}}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'FAIL _excludes (2)': {
      lhr: {
        audits: {
          'errors-in-console': {details: {items: {_excludes: [
            {description: /A distinctive error/},
          ]}}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
    'OK _includes and _excludes': {
      lhr: {
        audits: {
          'errors-in-console': {details: {items: {
            _includes: [
              {description: /A distinctive error/},
            ],
            // Passes because the above removes the relevant matching item from consideration.
            _excludes: [
              {description: /A distinctive error/},
            ],
          }}},
        },
        requestedUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
        finalUrl: 'http://localhost:10200/dobetterweb/dbw_tester.html',
      },
    },
  };

  for (const [testName, expected] of Object.entries(testCases)) {
    it(testName, () => {
      const report = getReport(expected);
      expect(clean(report.log)).toMatchSnapshot();
      if (testName.startsWith('OK')) expect(report.failed).toBe(0);
      if (testName.startsWith('FAIL')) expect(report.failed).not.toBe(0);
    });
  }
});
