@zoom-to-fit @android @iphone @desktop
Feature: Zoom to fit current page size in view
  In order to see the page I'm reading optimally when I browse through a publication with varying page sizes
  As a user
  I want the current page to fill the view as the initial zoom

  Background:
    Given the viewer is opened with a publication

  # TODO Somehow e2e starts with vertical scroll direction, but view menu shows horizontal direction
#  Scenario: Fit current page size in dashboard view
#    Given the viewer is in dashboard view
#    When the user navigates between the pages
#    Then the current page's size should be zoomed to fill the viewer

  Scenario Outline: Fit to width and height
    Given the viewer is in <pageView> view
    And the layout is <pageLayout>
    And the scroll direction is <scrollDirection>
    When the user click the fit to <dimension> button
    Then the current page size should equal the viewport <dimension>
    And should update the page size to fit to <dimension> when changing page

    Examples:
      | pageView  | pageLayout  | scrollDirection | dimension |
      | page      | two-page    | horizontal      | width     |
      | page      | two-page    | horizontal      | height    |
      | page      | two-page    | vertical        | width     |
      | page      | two-page    | vertical        | height    |
      | page      | one-page    | horizontal      | width     |
      | page      | one-page    | horizontal      | height    |
      | page      | one-page    | vertical        | width     |
      | page      | one-page    | vertical        | height    |
      | dashboard | two-page    | horizontal      | width     |
      | dashboard | two-page    | horizontal      | height    |
      | dashboard | two-page    | vertical        | width     |
      | dashboard | two-page    | vertical        | height    |
      | dashboard | one-page    | horizontal      | width     |
      | dashboard | one-page    | horizontal      | height    |
      | dashboard | one-page    | vertical        | width     |
      | dashboard | one-page    | vertical        | height    |
