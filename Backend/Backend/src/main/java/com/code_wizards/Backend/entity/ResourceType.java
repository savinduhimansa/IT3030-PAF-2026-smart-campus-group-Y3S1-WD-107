package com.code_wizards.Backend.entity;

public enum ResourceType {
    LECTURE_HALL("UNSPECIFIED"),
    LAB("UNSPECIFIED"),
    MEETING_ROOM("UNSPECIFIED"),
    PROJECTOR("UNSPECIFIED"),
    CAMERA("UNSPECIFIED"),
    EQUIPMENT("UNSPECIFIED");

    private final String department;

    ResourceType(String department) {
        this.department = department;
    }

    public String getDepartment() {
        return department;
    }
}