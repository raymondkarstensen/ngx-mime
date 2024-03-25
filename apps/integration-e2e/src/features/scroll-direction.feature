@scroll-direction
Feature: Scroll Direction
  In order to browse through the publication
  As a user
  I want to navigate both horizontally and vertically

  @android @iphone @desktop
  Scenario: Vertical scroll direction
    Given the viewer is opened with a publication
    When the scroll direction is vertical
    Then the publication should be rendered vertically

  @android @iphone @desktop
  Scenario: Horizontal scroll direction
    Given the viewer is opened with a publication
    When the scroll direction is horizontal
    Then the publication should be rendered horizontally
